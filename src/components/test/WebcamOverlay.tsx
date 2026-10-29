import React, { useRef, useEffect, useState } from 'react';
import { AlertCircle, GripHorizontal, Mic, Eye, ShieldCheck } from 'lucide-react';
import { useProctorStore } from '@/stores/proctorStore';

export const WebcamOverlay: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { webcamStatus, riskLevel } = useProctorStore();

  // Simulated audio level meter for ambient acoustic monitoring
  const [audioLevel, setAudioLevel] = useState(25);
  // Simulated head pose & gaze telemetry
  const [telemetry, setTelemetry] = useState({ yaw: 1.2, pitch: -0.8, gaze: 'CENTER' });

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
    navigator.mediaDevices
      .getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: true })
      .then((s) => {
        activeStream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(() => {
        // Fallback to video only if audio is blocked
        navigator.mediaDevices
          .getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' } })
          .then((s) => {
            activeStream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
            }
          })
          .catch(() => {
            setCameraError('Camera inactive');
          });
      });

    // Simulate telemetry fluctuations
    const interval = setInterval(() => {
      setAudioLevel(18 + Math.floor(Math.random() * 22));
      setTelemetry({
        yaw: Number((Math.sin(Date.now() / 3000) * 3).toFixed(1)),
        pitch: Number((Math.cos(Date.now() / 2500) * 2).toFixed(1)),
        gaze: 'ON SCREEN',
      });
    }, 1200);

    return () => {
      clearInterval(interval);
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

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
      className="fixed z-40 w-52 rounded-xl border-2 border-border/80 bg-card/95 shadow-2xl backdrop-blur-md overflow-hidden select-none transition-shadow hover:shadow-cyan-500/10"
    >
      {/* Draggable Title Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-2.5 py-1.5 bg-muted/80 border-b border-border text-[10px] cursor-grab active:cursor-grabbing text-muted-foreground"
      >
        <span className="flex items-center gap-1 font-semibold text-foreground">
          <GripHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          AI Proctor HUD
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
            Camera unavailable
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

            {/* Simulated AI Face Landmark Bounding Frame */}
            <div className="absolute inset-4 border border-cyan-400/50 rounded-lg pointer-events-none flex flex-col justify-between p-1">
              <div className="flex justify-between text-[8px] text-cyan-300 font-mono">
                <span>98.6% MATCH</span>
                <span>Y:{telemetry.yaw}° P:{telemetry.pitch}°</span>
              </div>
              <div className="flex justify-between items-end text-[8px] text-emerald-400 font-mono">
                <span className="flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" /> {telemetry.gaze}
                </span>
                <span className="flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" /> SECURE
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Telemetry Footer: Audio VU meter & Head Angle */}
      <div className="px-2.5 py-1.5 bg-muted/40 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <div className="flex items-center gap-1">
          <Mic className="w-3 h-3 text-emerald-500" />
          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, audioLevel * 2)}%` }}
              className="h-full bg-emerald-500 transition-all duration-300"
            />
          </div>
        </div>

        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
          PROCTOR ACTIVE
        </span>
      </div>
    </div>
  );
};
