import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { OtpInput } from '@/components/auth/OtpInput';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Mail, Shield, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    email,
    setEmail,
    isOtpSent,
    isLoading,
    error,
    activeSessionConflict,
    sendOtp,
    verifyOtp,
    loginWithGoogle,
    resetError,
  } = useAuthStore();

  const [resendTimer, setResendTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpSent && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, resendTimer]);

  useEffect(() => {
    if (activeSessionConflict) {
      navigate('/session-blocked');
    }
  }, [activeSessionConflict, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const ok = await sendOtp();
    if (ok) {
      setResendTimer(30);
      setCanResend(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    const ok = await sendOtp();
    if (ok) {
      setResendTimer(30);
      setCanResend(false);
    }
  };

  const handleOtpComplete = async (otp: string) => {
    resetError();
    const ok = await verifyOtp(otp);
    if (ok) {
      navigate('/face-verification');
    }
  };

  const handleGoogleSignIn = async () => {
    resetError();
    const ok = await loginWithGoogle();
    if (ok) {
      navigate('/face-verification');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Candidate Authentication
          </h1>
          <p className="text-sm text-muted-foreground">
            {isOtpSent
              ? `Enter the 6-digit security verification code sent to ${email}`
              : 'Enter your registered examination email to receive a single-use passcode.'}
          </p>
        </div>

        <Card className="p-6 space-y-6">
          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  (Demo tip: you can use <code className="text-primary font-mono">candidate@example.com</code> or any email)
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={!email}
                className="w-full gap-2"
              >
                Send Verification Code
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-3 text-xs text-muted-foreground uppercase">or</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-lg bg-card hover:bg-muted text-sm font-medium text-foreground transition-all shadow-xs disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-border">
                <span className="text-muted-foreground font-medium">Recipient: {email}</span>
                <button
                  onClick={() => {
                    useAuthStore.setState({ isOtpSent: false, error: null });
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Change email
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  6-Digit OTP Code
                </label>
                <OtpInput onComplete={handleOtpComplete} disabled={isLoading} />
                <p className="text-center text-[11px] text-muted-foreground">
                  (Demo: enter any 6 digits such as <code className="text-primary font-mono">123456</code>)
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isLoading}
                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium disabled:opacity-50 disabled:no-underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                </button>

                {isLoading && (
                  <span className="text-muted-foreground inline-flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Validating...
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/consent')}
            className="text-xs text-muted-foreground gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Rules
          </Button>
        </div>
      </div>
    </div>
  );
};
