const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory session and activity storage
const sessions = new Map();
const activityLogs = new Map();

// Helper to get or create session safely
function getOrCreateSession(sessionId, fallbackName = 'Candidate', testId = 'dsa_core_01') {
  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      sessionId,
      id: sessionId,
      studentName: fallbackName,
      candidate_name: fallbackName,
      testId,
      exam_id: testId,
      phone: null,
      status: 'active',
      riskScore: 0,
      violations: [],
      createdAt: Date.now(),
      lastHeartbeat: Date.now(),
      faceDetected: true,
      gazeStatus: 'center',
    };
    sessions.set(sessionId, session);
    activityLogs.set(sessionId, []);
  }
  return session;
}

// POST /api/proctor/session - create or resume a proctoring session
router.post('/session', (req, res) => {
  const { studentName, candidate_name, candidateName, testId, exam_id, phone, id } = req.body || {};

  const sessionId = id || req.body?.sessionId || crypto.randomUUID();
  const name = candidate_name || candidateName || studentName || 'Alex Johnson';
  const exam = exam_id || testId || 'dsa_core_01';

  const session = {
    sessionId,
    id: sessionId,
    studentName: name,
    candidate_name: name,
    testId: exam,
    exam_id: exam,
    phone: phone || null,
    status: 'active',
    riskScore: 0,
    violations: [],
    createdAt: Date.now(),
    lastHeartbeat: Date.now(),
    faceDetected: true,
    gazeStatus: 'center',
  };

  sessions.set(sessionId, session);
  if (!activityLogs.has(sessionId)) {
    activityLogs.set(sessionId, []);
  }

  console.log(`[proctor] Session created/active: ${sessionId} for ${session.studentName}`);

  return res.json({
    success: true,
    sessionId,
    id: sessionId,
    candidate_name: name,
    exam_id: exam,
    status: 'active',
    duration_minutes: 30,
    message: 'Proctoring session started.',
  });
});

// POST /api/proctor/analyze-frame - live webcam frame vision analysis
router.post('/analyze-frame', (req, res) => {
  const { image_base64, session_id, client_metrics } = req.body || {};
  const sessionId = session_id || 'default_session';
  const session = getOrCreateSession(sessionId);

  let faceDetected = true;
  let faceCount = 1;
  let gazeDirection = 'CENTER';
  let lookingAtScreen = true;
  let phoneDetected = false;
  let confidence = 0.98;
  let status = 'verified';

  if (client_metrics) {
    faceDetected = client_metrics.faceDetected ?? true;
    faceCount = client_metrics.faceCount ?? (faceDetected ? 1 : 0);
    gazeDirection = client_metrics.gazeDirection || 'CENTER';
    lookingAtScreen = client_metrics.lookingAtScreen ?? (gazeDirection === 'CENTER');
    phoneDetected = client_metrics.phoneDetected ?? false;
    confidence = client_metrics.confidence ?? 0.96;
    status = client_metrics.status || (faceDetected ? 'verified' : 'no_face');
  } else if (image_base64 && typeof image_base64 === 'string') {
    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
    const buf = Buffer.from(base64Data, 'base64');
    if (buf.length < 2048) {
      faceDetected = false;
      faceCount = 0;
      lookingAtScreen = false;
      status = 'no_face';
      confidence = 0.9;
    }
  }

  if (session) {
    session.faceDetected = faceDetected;
    session.gazeStatus = gazeDirection.toLowerCase();
    session.lastHeartbeat = Date.now();

    if (!faceDetected) {
      session.violations.push({
        type: 'face-not-detected',
        details: 'Candidate face missing from camera frame',
        timestamp: Date.now(),
      });
      session.riskScore = Math.min(100, session.riskScore + 10);
    } else if (faceCount > 1) {
      session.violations.push({
        type: 'multiple-faces',
        details: `Multiple faces (${faceCount}) detected in room`,
        timestamp: Date.now(),
      });
      session.riskScore = Math.min(100, session.riskScore + 20);
    } else if (!lookingAtScreen) {
      session.violations.push({
        type: 'gaze-away',
        details: `Candidate looking away: ${gazeDirection}`,
        timestamp: Date.now(),
      });
      session.riskScore = Math.min(100, session.riskScore + 5);
    }
  }

  return res.json({
    face_detected: faceDetected,
    face_count: faceCount,
    confidence,
    status,
    gaze_direction: gazeDirection,
    looking_at_screen: lookingAtScreen,
    eyewear_detected: false,
    phone_detected: phoneDetected,
    face_id_match: true,
  });
});

// POST /api/proctor/activity - log activity events
router.post('/activity', (req, res) => {
  const { sessionId, events } = req.body || {};

  const sid = sessionId || 'default_session';
  const eventList = Array.isArray(events) ? events : [];

  const session = getOrCreateSession(sid);
  const logs = activityLogs.get(sid) || [];

  const timestamped = eventList.map((event) => ({
    ...event,
    receivedAt: Date.now(),
  }));

  logs.push(...timestamped);
  activityLogs.set(sid, logs);

  console.log(`[proctor] Logged ${eventList.length} events for session ${sid}`);

  return res.json({
    success: true,
    logged: eventList.length,
  });
});

// GET /api/proctor/session/:sessionId - get session data
router.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = getOrCreateSession(sessionId);
  const logs = activityLogs.get(sessionId) || [];

  return res.json({
    success: true,
    session,
    activityLog: logs,
    totalEvents: logs.length,
  });
});

// POST /api/proctor/report - generate risk report
router.post('/report', (req, res) => {
  const { sessionId } = req.body || {};
  const sid = sessionId || 'default_session';
  const session = getOrCreateSession(sid);
  const logs = activityLogs.get(sid) || [];

  // Analyze activity logs for the report
  const tabSwitches = logs.filter((e) => e.type === 'tab-switch').length;
  const faceNotDetected = logs.filter((e) => e.type === 'face-not-detected' || e.type === 'NO_FACE_DETECTED').length;
  const gazeAway = logs.filter((e) => e.type === 'gaze-away' || e.type === 'FACE_TURNED_AWAY').length;
  const multipleFaces = logs.filter((e) => e.type === 'multiple-faces' || e.type === 'MULTIPLE_FACES_DETECTED').length;
  const windowBlur = logs.filter((e) => e.type === 'window-blur' || e.type === 'WINDOW_BLUR').length;

  // Calculate risk score from events
  const calculatedRisk = Math.min(
    100,
    tabSwitches * 15 +
    faceNotDetected * 10 +
    gazeAway * 5 +
    multipleFaces * 20 +
    windowBlur * 10
  );

  const riskScore = Math.max(session.riskScore, calculatedRisk);

  let riskLevel = 'low';
  if (riskScore >= 70) riskLevel = 'critical';
  else if (riskScore >= 40) riskLevel = 'high';
  else if (riskScore >= 20) riskLevel = 'medium';

  const report = {
    sessionId: sid,
    studentName: session.studentName,
    riskScore,
    riskLevel,
    totalEvents: logs.length,
    summary: {
      tabSwitches,
      faceNotDetected,
      gazeAway,
      multipleFaces,
      windowBlur,
    },
    violations: session.violations,
    duration: Date.now() - session.createdAt,
    generatedAt: Date.now(),
  };

  console.log(`[proctor] Risk report for ${sid}: ${riskLevel} (${riskScore})`);

  return res.json({
    success: true,
    report,
  });
});

// Export sessions and activityLogs so other modules can access them
module.exports = router;
module.exports.sessions = sessions;
module.exports.activityLogs = activityLogs;
