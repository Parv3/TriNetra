import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface Props {
  onCapture: (dataUri: string) => Promise<boolean>;
  registeredPhotoUrl?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const FaceCapture: React.FC<Props> = ({
  onCapture,
  registeredPhotoUrl,
  isLoading = false,
  errorMessage,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setCameraError('Unable to access webcam. Please ensure camera permissions are granted.');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally for natural mirror feel
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const dataUri = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUri);

    setIsVerifying(true);
    await onCapture(dataUri);
    setIsVerifying(false);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto">
      {/* Side by side preview if registered photo exists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {registeredPhotoUrl && (
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Registered ID Photo
            </span>
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
              <img
                src={registeredPhotoUrl}
                alt="Registered candidate ID"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className={`flex flex-col items-center ${!registeredPhotoUrl ? 'col-span-full' : ''}`}>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Live Camera Preview
          </span>
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-border bg-black flex items-center justify-center">
            {cameraError ? (
              <div className="p-4 text-center">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <p className="text-xs text-rose-400">{cameraError}</p>
                <Button size="sm" variant="outline" onClick={startCamera} className="mt-3">
                  Retry Camera
                </Button>
              </div>
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured live face"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
                {/* Oval face guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-44 h-56 border-2 border-dashed border-primary/70 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                </div>
                <div className="absolute bottom-2 text-center text-[11px] text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
                  Center your face inside the oval
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-600 dark:text-rose-400 w-full">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {capturedImage ? (
          <Button
            variant="outline"
            onClick={handleRetake}
            disabled={isLoading || isVerifying}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retake Photo
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleCapture}
            isLoading={isLoading || isVerifying}
            disabled={!!cameraError}
            className="gap-2 px-6"
          >
            <Camera className="w-4 h-4" />
            Capture & Verify Face
          </Button>
        )}
      </div>
    </div>
  );
};
