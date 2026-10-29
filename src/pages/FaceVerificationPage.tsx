import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { FaceCapture } from '@/components/auth/FaceCapture';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { UserCheck, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export const FaceVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, verifyFace, isFaceVerified, isLoading, error } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCapture = async (dataUri: string): Promise<boolean> => {
    const verified = await verifyFace(dataUri);
    if (verified) {
      setSuccessMessage('Biometric identity successfully verified against the institutional registry.');
    }
    return verified;
  };

  const handleProceedToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
            <UserCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Biometric Facial Verification
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Welcome, <strong className="text-foreground">{user?.name || user?.email || 'Candidate'}</strong>.
            Position your face squarely within the frame to verify identity against your registered credential.
          </p>
        </div>

        <Card className="p-6">
          <FaceCapture
            onCapture={handleCapture}
            registeredPhotoUrl={user?.registeredPhotoUrl}
            isLoading={isLoading}
            errorMessage={error}
          />

          {isFaceVerified && (
            <div className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center text-center gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>Identity Verified Successfully</span>
              </div>
              <p className="text-xs text-muted-foreground">{successMessage}</p>

              <Button
                variant="primary"
                size="lg"
                onClick={handleProceedToDashboard}
                className="mt-2 gap-2"
              >
                Enter Candidate Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>

        {!isFaceVerified && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-xs text-muted-foreground gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to OTP Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

