/**
 * Real API Client connecting TriNetra Frontend to Dhristi Node/Express Backend (Port 3001)
 */

export const BACKEND_URL = 'http://localhost:3001';

export interface BackendSession {
  id: string;
  exam_id: string;
  candidate_name: string;
  candidate_id: string;
  status: string;
  face_id?: string;
  duration_minutes: number;
}

export interface ClientVisionMetrics {
  faceDetected?: boolean;
  faceCount?: number;
  gazeDirection?: string;
  lookingAtScreen?: boolean;
  phoneDetected?: boolean;
  confidence?: number;
  status?: string;
}

export interface FrameAnalysisResult {
  face_detected: boolean;
  face_count: number;
  confidence: number;
  status: string;
  gaze_direction: string;
  looking_at_screen: boolean;
  eyewear_detected: boolean;
  phone_detected: boolean;
  face_id_match: boolean;
}

/**
 * Ensures an active session exists in Dhristi backend.
 * If one exists, retrieves or creates it and returns the session.
 */
export async function getOrCreateBackendSession(
  candidateName = 'Alex Johnson',
  candidateId = 'cand_alex_01'
): Promise<BackendSession> {
  try {
    const existingId = localStorage.getItem('spb_session_id');

    const res = await fetch(`${BACKEND_URL}/api/proctor/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: existingId || undefined,
        sessionId: existingId || undefined,
        studentName: candidateName,
        candidateName: candidateName,
        candidate_name: candidateName,
        candidateId: candidateId,
        testId: 'dsa_core_01',
      }),
    });

    if (!res.ok) {
      throw new Error(`Session creation failed: HTTP ${res.status}`);
    }

    const data = await res.json();
    const finalSessionId = data.sessionId || data.id || existingId;

    if (finalSessionId) {
      localStorage.setItem('spb_session_id', finalSessionId);
    }

    return {
      id: finalSessionId,
      exam_id: 'dsa_core_01',
      candidate_name: candidateName,
      candidate_id: candidateId,
      status: 'active',
      duration_minutes: 30,
    };
  } catch (err) {
    console.warn('[Dhristi Backend] Session sync error, using cached/local session:', err);
    let fallbackId = localStorage.getItem('spb_session_id');
    if (!fallbackId) {
      fallbackId = `TRN-DH-${Date.now().toString(36).toUpperCase()}`;
      localStorage.setItem('spb_session_id', fallbackId);
    }
    return {
      id: fallbackId,
      exam_id: 'dsa_core_01',
      candidate_name: candidateName,
      candidate_id: candidateId,
      status: 'active',
      duration_minutes: 30,
    };
  }
}

/**
 * Sends a live camera frame & client vision metrics to Dhristi proctoring engine.
 */
export async function analyzeLiveFrame(
  imageBase64: string,
  sessionId?: string,
  clientMetrics?: ClientVisionMetrics
): Promise<FrameAnalysisResult> {
  const activeSessionId = sessionId || localStorage.getItem('spb_session_id') || 'default_session';

  try {
    const res = await fetch(`${BACKEND_URL}/api/proctor/analyze-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_base64: imageBase64,
        session_id: activeSessionId,
        client_metrics: clientMetrics,
      }),
    });

    if (!res.ok) {
      throw new Error(`Analyze frame HTTP error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    // If backend is momentarily unreachable, use client metrics directly
    const faceDet = clientMetrics?.faceDetected ?? true;
    const faceCnt = clientMetrics?.faceCount ?? (faceDet ? 1 : 0);
    const gazeDir = clientMetrics?.gazeDirection || 'CENTER';

    return {
      face_detected: faceDet,
      face_count: faceCnt,
      confidence: clientMetrics?.confidence ?? 0.95,
      status: faceDet ? 'verified' : 'no_face',
      gaze_direction: gazeDir,
      looking_at_screen: clientMetrics?.lookingAtScreen ?? (gazeDir === 'CENTER'),
      eyewear_detected: false,
      phone_detected: clientMetrics?.phoneDetected ?? false,
      face_id_match: true,
    };
  }
}

/**
 * Logs an integrity event to Dhristi backend database & proctor audit log.
 */
export async function logIntegrityEvent(
  sessionId: string,
  eventType: string,
  metadata: Record<string, any> = {},
  severity = 'medium',
  confidence = 0.95
): Promise<any> {
  const sid = sessionId || localStorage.getItem('spb_session_id') || 'default_session';

  try {
    const res = await fetch(`${BACKEND_URL}/api/proctor/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sid,
        events: [
          {
            type: eventType,
            severity,
            confidence,
            details: metadata,
            timestamp: Date.now(),
          },
        ],
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Dhristi Backend] logIntegrityEvent error:', err);
  }
  return null;
}

/**
 * Submits the examination session to finalize and compute final audit verdict.
 */
export async function submitBackendSession(sessionId: string): Promise<any> {
  const sid = sessionId || localStorage.getItem('spb_session_id') || 'default_session';

  try {
    const res = await fetch(`${BACKEND_URL}/api/proctor/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Dhristi Backend] submitBackendSession error:', err);
  }
  return null;
}
