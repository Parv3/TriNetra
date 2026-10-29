import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AlertCircle, GripHorizontal, Mic, Eye, ShieldCheck, Users, EyeOff } from 'lucide-react';
import { useProctorStore } from '@/stores/proctorStore';
import { useAuthStore } from '@/stores/authStore';
import { analyzeLiveFrame, logIntegrityEvent } from '@/services/api/realApi';

export const WebcamOverlay: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { webcamStatus, riskLevel, reportViolation } = useProctorStore();
  const { session } = useAuthStore();

  const [audioLevel, setAudioLevel] = useState(15);
  const [telemetry, setTelemetry] = useState({
    gaze: 'CENTER',
    lookingAtScreen: true,
    faceCount: 1,
    confidence: 98.5,
    statusText: 'VERIFIED',
  });

  // Consecutive anomaly counters to prevent single-frame flickering
  const gazeAwayCountRef = useRef(0);
  const noFaceCountRef = useRef(0);
  const multiFaceCountRef = useRef(0);
  const isAnalyzingRef = useRef(false);
  const lastViolationTimeRef = useRef<Record<string, number>>({});

  const emitViolation = useCallback(
    (type: any, reason: string, isMajor = false, cooldownSec = 8) => {
      const now = Date.now();
      const last = lastViolationTimeRef.current[type] || 0;
      if (now - last >= cooldownSec * 1000) {
        lastViolationTimeRef.current[type] = now;
        reportViolation(type, reason, isMajor);
        const sessId = session?.sessionId || localStorage.getItem('spb_session_id') || 'active_session';
        logIntegrityEvent(sessId, type, { reason }, isMajor ? 'high' : 'medium');
      }
    },
    [reportViolation, session]
  );

  // Draggable position
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 24,
    posY: 24,
  });

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animId: number | null = null;

    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      })
      .then((s) => {
        activeStream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }

        // Real microphone level via Web Audio API
        try {
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioCtx.createMediaStreamSource(s);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateAudio = () => {
            if (analyser) {
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((avg / 255) * 120)));
            }
            animId = requestAnimationFrame(updateAudio);
          };
          updateAudio();
        } catch (e) {
          console.warn('[Audio Analyser] Error initializing microphone audio context:', e);
        }
      })
      .catch(() => {
        navigator.mediaDevices
          .getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
          .then((s) => {
            activeStream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
            }
          })
          .catch((err) => {
            setCameraError('Camera access required for proctoring.');
            console.warn('Camera capture error:', err);
          });
      });

    // Real computer vision frame capture loop every 1.2 seconds
    const interval = setInterval(async () => {
      if (
        !videoRef.current ||
        !canvasRef.current ||
        isAnalyzingRef.current ||
        videoRef.current.readyState < 2
      ) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const w = 480;
      const h = 360;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

      // Real computer vision frame analysis
      let faceDetected = true;
      let faceCount = 1;
      let gazeDirection = 'CENTER';
      let lookingAtScreen = true;
      let confidence = 0.98;

      try {
        const frameData = ctx.getImageData(0, 0, w, h);
        const data = frameData.data;
        let totalLum = 0;
        let skinPixels = 0;
        let leftLum = 0;
        let rightLum = 0;
        let midPixels = 0;

        for (let y = Math.floor(h * 0.15); y < Math.floor(h * 0.85); y += 4) {
          for (let x = Math.floor(w * 0.15); x < Math.floor(w * 0.85); x += 4) {
            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            totalLum += lum;
            midPixels++;

            if (r > 60 && g > 40 && b > 20 && r > g && g > b && (r - g) > 12) {
              skinPixels++;
              if (x < w * 0.5) leftLum += lum;
              else rightLum += lum;
            }
          }
        }

        const avgLum = totalLum / (midPixels || 1);
        const skinRatio = skinPixels / (midPixels || 1);

        if (typeof (window as any).FaceDetector !== 'undefined') {
          try {
            const detector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
            const faces = await detector.detect(video);
            faceCount = faces.length;
            faceDetected = faceCount > 0;
          } catch {}
        } else {
          if (avgLum < 12 || skinRatio < 0.05) {
            faceDetected = false;
            faceCount = 0;
          } else {
            faceDetected = true;
            faceCount = 1;
          }
        }

        if (faceDetected && skinPixels > 50) {
          const balance = (leftLum + 1) / (rightLum + 1);
          if (balance > 1.45) {
            gazeDirection = 'RIGHT';
            lookingAtScreen = false;
          } else if (balance < 0.65) {
            gazeDirection = 'LEFT';
            lookingAtScreen = false;
          } else {
            gazeDirection = 'CENTER';
            lookingAtScreen = true;
          }
        } else if (!faceDetected) {
          lookingAtScreen = false;
          gazeDirection = 'AWAY';
        }
      } catch (cvErr) {
        console.warn('[CV Process]', cvErr);
      }

      isAnalyzingRef.current = true;
      try {
        const sessId = session?.sessionId || localStorage.getItem('spb_session_id') || undefined;
        const result = await analyzeLiveFrame(dataUrl, sessId, {
          faceDetected,
          faceCount,
          gazeDirection,
          lookingAtScreen,
          confidence,
        });

        // Update live HUD
        setTelemetry({
          gaze: result.gaze_direction || gazeDirection,
          lookingAtScreen: result.looking_at_screen,
          faceCount: result.face_count,
          confidence: Number((result.confidence * 100).toFixed(1)),
          statusText: result.status.toUpperCase(),
        });

        // 1. Face Absence Detection (3 consecutive frames ~ 3.6s)
        if (!result.face_detected || result.face_count === 0) {
          noFaceCountRef.current += 1;
          if (noFaceCountRef.current >= 3) {
            emitViolation(
              'NO_FACE_DETECTED',
              'Candidate face is not detected in camera frame.',
              true,
              10
            );
            noFaceCountRef.current = 0;
          }
        } else {
          noFaceCountRef.current = 0;
        }

        // 2. Multiple Individuals Detection (2 consecutive frames)
        if (result.face_count > 1) {
          multiFaceCountRef.current += 1;
          if (multiFaceCountRef.current >= 2) {
            emitViolation(
              'MULTIPLE_FACES_DETECTED',
              `Multiple individuals (${result.face_count}) detected in proctor frame.`,
              true,
              10
            );
            multiFaceCountRef.current = 0;
          }
        } else {
          multiFaceCountRef.current = 0;
        }

        // 3. Gaze & Looking Away (3 consecutive frames)
        if (!result.looking_at_screen || result.gaze_direction !== 'CENTER') {
          gazeAwayCountRef.current += 1;
          if (gazeAwayCountRef.current >= 3) {
            emitViolation(
              'FACE_TURNED_AWAY',
              `Prolonged gaze orientation away from screen: looking ${result.gaze_direction}.`,
              false,
              10
            );
            gazeAwayCountRef.current = 0;
          }
        } else {
          gazeAwayCountRef.current = 0;
        }

        // 4. Unauthorized Mobile Device Detection
        if (result.phone_detected) {
          emitViolation(
            'SUSPICIOUS_SHORTCUT',
            'Prohibited mobile device detected in camera frame.',
            true,
            12
          );
        }
      } catch (err) {
        console.warn('[Proctor Vision] Frame analysis error:', err);
      } finally {
        isAnalyzingRef.current = false;
      }
    }, 1200);

    return () => {
      clearInterval(interval);
      if (animId) cancelAnimationFrame(animId);
      if (audioCtx) audioCtx.close().catch(console.warn);
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [emitViolation, session]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = dragRef.current.startX - e.clientX;
      const dy = dragRef.current.startY - e.clientY;
      setPosition({
        x: Math.max(16, Math.min(window.innerWidth - 220, dragRef.current.posX + dx)),
        y: Math.max(16, Math.min(window.innerHeight - 200, dragRef.current.posY + dy)),
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const statusColors = {
    ok: 'border-emerald-500 bg-emerald-500',
    caution: 'border-amber-500 bg-amber-500',
    violation: 'border-rose-500 bg-rose-500',
  };

  return (
    <div
      style={{ bottom: `${position.y}px`, right: `${position.x}px` }}
      className="fixed z-40 w-56 rounded-xl border-2 border-border/80 bg-card/95 shadow-2xl backdrop-blur-md overflow-hidden select-none transition-shadow hover:shadow-cyan-500/10"
    >
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Draggable Title Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-2.5 py-1.5 bg-muted/80 border-b border-border text-[10px] cursor-grab active:cursor-grabbing text-muted-foreground"
      >
        <span className="flex items-center gap-1 font-semibold text-foreground">
          <GripHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          AI Vision Proctor HUD
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${statusColors[webcamStatus]} ${
              riskLevel !== 'green' ? 'animate-ping' : ''
            }`}
          />
          <span className="uppercase font-bold tracking-wider text-[9px] text-foreground">
            {riskLevel}
          </span>
        </div>
      </div>

      {/* Video Window with HUD Bounding Box */}
      <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
        {cameraError ? (
          <div className="p-2 text-center text-[10px] text-rose-400">
            <AlertCircle className="w-4 h-4 mx-auto mb-1 text-rose-500" />
            {cameraError}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />

            {/* Live AI Face Landmark Bounding Frame */}
            <div
              className={`absolute inset-3 border-2 rounded-lg pointer-events-none flex flex-col justify-between p-1 transition-colors ${
                telemetry.faceCount === 0 || !telemetry.lookingAtScreen
                  ? 'border-rose-500/80 bg-rose-500/10'
                  : telemetry.faceCount > 1
                  ? 'border-amber-500/80 bg-amber-500/10'
                  : 'border-cyan-400/50'
              }`}
            >
              <div className="flex justify-between text-[8px] text-cyan-300 font-mono">
                <span>{telemetry.confidence}% FACE</span>
                <span className="flex items-center gap-0.5">
                  <Users className="w-2.5 h-2.5" /> {telemetry.faceCount} {telemetry.faceCount === 1 ? 'FACE' : 'FACES'}
                </span>
              </div>
              <div className="flex justify-between items-end text-[8px] font-mono">
                <span
                  className={`flex items-center gap-0.5 font-bold ${
                    telemetry.lookingAtScreen ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {telemetry.lookingAtScreen ? (
                    <Eye className="w-2.5 h-2.5" />
                  ) : (
                    <EyeOff className="w-2.5 h-2.5" />
                  )}
                  {telemetry.gaze}
                </span>
                <span
                  className={`flex items-center gap-0.5 font-bold ${
                    telemetry.faceCount === 1 && telemetry.lookingAtScreen
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  <ShieldCheck className="w-2.5 h-2.5" /> {telemetry.statusText}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Telemetry Footer: Audio VU meter & Status */}
      <div className="px-2.5 py-1.5 bg-muted/40 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <div className="flex items-center gap-1.5" title={`Microphone Level: ${audioLevel}%`}>
          <Mic className={`w-3 h-3 ${audioLevel > 20 ? 'text-emerald-500' : 'text-slate-400'}`} />
          <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, audioLevel)}%` }}
              className={`h-full transition-all duration-150 ${
                audioLevel > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>

        <span
          className={`text-[9px] font-semibold ${
            telemetry.faceCount === 1 && telemetry.lookingAtScreen
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400 font-bold'
          }`}
        >
          {telemetry.faceCount === 0
            ? 'NO FACE'
            : !telemetry.lookingAtScreen
            ? 'LOOKING AWAY'
            : telemetry.faceCount > 1
            ? 'MULTIPLE FACES'
            : 'LIVE PROCTOR'}
        </span>
      </div>
    </div>
  );
};
