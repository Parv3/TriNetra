import React, { useEffect, useState } from 'react';
import { useProctorStore } from '@/stores/proctorStore';
import { AlertTriangle, AlertOctagon, ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface Props {
  onAutoSubmitDisqualification?: () => void;
}

export const WarningModal: React.FC<Props> = ({ onAutoSubmitDisqualification }) => {
  const {
    activeWarningModal,
    warningsCount,
    maxWarnings,
    isDisqualified,
    disqualificationReason,
    dismissWarningModal,
  } = useProctorStore();

  const [acknowledgementCountdown, setAcknowledgementCountdown] = useState(3);

  useEffect(() => {
    if (activeWarningModal) {
      setAcknowledgementCountdown(3);
      const timer = setInterval(() => {
        setAcknowledgementCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeWarningModal]);

  useEffect(() => {
    if (isDisqualified && onAutoSubmitDisqualification) {
      onAutoSubmitDisqualification();
    }
  }, [isDisqualified, onAutoSubmitDisqualification]);

  if (!activeWarningModal && !isDisqualified) return null;

  const isFinalWarning = warningsCount === maxWarnings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-card border-2 border-rose-500/40 rounded-2xl shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
            {isDisqualified ? (
              <AlertOctagon className="w-8 h-8" />
            ) : isFinalWarning ? (
              <ShieldAlert className="w-8 h-8" />
            ) : (
              <AlertTriangle className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
              {isDisqualified
                ? 'Test Disqualification'
                : `Official Warning (${warningsCount}/${maxWarnings})`}
            </span>
            <h3 className="text-lg font-bold text-foreground font-heading">
              {isDisqualified
                ? 'Session Terminated'
                : isFinalWarning
                ? 'FINAL WARNING ISSUED'
                : 'Security Policy Violation'}
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/60 border border-border text-xs leading-relaxed space-y-2">
          <p className="font-semibold text-foreground">
            {isDisqualified
              ? disqualificationReason
              : activeWarningModal?.title || 'Security Anomaly Detected'}
          </p>
          <p className="text-muted-foreground">
            {activeWarningModal?.reason ||
              'Ensure you remain facing your primary screen. External aids and auxiliary tabs are actively tracked.'}
          </p>
        </div>

        {!isDisqualified && (
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ One more violation will immediately disqualify this attempt and submit your answers.
          </div>
        )}

        <div className="pt-2">
          {!isDisqualified ? (
            <Button
              variant="destructive"
              size="lg"
              disabled={acknowledgementCountdown > 0}
              onClick={dismissWarningModal}
              className="w-full gap-2 font-semibold"
            >
              {acknowledgementCountdown > 0
                ? `Acknowledge Warning (${acknowledgementCountdown}s)`
                : 'I Understand & Resume Test'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="text-center text-xs text-rose-500 font-medium">
              Submitting test logs to academic board...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

