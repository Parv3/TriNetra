import React from 'react';
import { useProctorStore } from '@/stores/proctorStore';
import { X, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ViolationsDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { violations, warningsCount, maxWarnings } = useProctorStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-card border-l border-border h-full shadow-2xl z-10 flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold font-heading text-foreground">
              Violation Log ({warningsCount}/{maxWarnings})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          All infractions detected by on-device computer vision and browser shell security monitors.
        </p>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {violations.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground space-y-2">
              <span className="text-2xl">🛡️</span>
              <p className="text-xs font-medium text-foreground">Clean Record</p>
              <p className="text-[11px]">No security warnings recorded for this session.</p>
            </div>
          ) : (
            violations.map((v) => (
              <div
                key={v.id}
                className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {v.title}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {v.formattedTime}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">{v.reason}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

