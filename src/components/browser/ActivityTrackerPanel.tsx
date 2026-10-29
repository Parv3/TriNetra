import React from 'react';
import { useBrowserStore } from '@/stores/browserStore';
import {
  X,
  Activity,
  AlertTriangle,
  Search,
  Globe,
  Clock,
  Shield,
} from 'lucide-react';

export const ActivityTrackerPanel: React.FC = () => {
  const { isActivityTrackerOpen, activityLog, toggleActivityTracker, aiPolicy } = useBrowserStore();

  if (!isActivityTrackerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={toggleActivityTracker} />

      <div className="relative w-full max-w-md bg-card border-l border-border h-full shadow-2xl z-10 flex flex-col p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold font-heading text-foreground">
              Smart Activity Tracker
            </h3>
          </div>
          <button
            onClick={toggleActivityTracker}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Close activity tracker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Policy Chip */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#5B4BFF]" />
            <span className="font-semibold text-foreground">AI Tools Policy:</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/30">
            {aiPolicy.replace(/_/g, ' ')}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Real-time timeline of browser tabs opened, duration, and search queries logged during this session.
        </p>

        {/* Activity Timeline */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activityLog.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
              No browser activity logged yet.
            </div>
          ) : (
            activityLog.map((act) => {
              const isAi = act.category === 'AI_TOOL';
              const isSearch = act.category === 'SEARCH';

              return (
                <div
                  key={act.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                    isAi
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : isSearch
                      ? 'border-cyan-500/30 bg-cyan-500/5'
                      : 'border-border/80 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{act.formattedTime}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        isAi
                          ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                          : isSearch
                          ? 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {act.category === 'AI_TOOL' ? 'AI TOOL' : act.category}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 pt-0.5">
                    {isAi ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : isSearch ? (
                      <Search className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                    ) : (
                      <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-0.5 flex-1">
                      <p className="font-semibold text-foreground">
                        {act.action === 'OPENED_TAB' && `Opened ${act.domain}`}
                        {act.action === 'CLOSED_TAB' && `Closed ${act.domain} (${act.durationSec}s dwell)`}
                        {act.action === 'SEARCHED' && `Searched query`}
                        {act.action === 'NAVIGATED' && `Navigated to ${act.domain}`}
                      </p>

                      {act.query && (
                        <p className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 p-1.5 rounded">
                          "{act.query}"
                        </p>
                      )}

                      {act.title && act.title !== act.domain && (
                        <p className="text-[11px] text-muted-foreground">{act.title}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Typed Prompts Placeholder Note */}
        <div className="p-3 bg-muted/40 rounded-xl border border-border text-[11px] text-muted-foreground">
          💡 <span className="font-medium text-foreground">Audit Notice:</span> DOM input field key-event hooks capture URL parameters; deep inside-iframe keystroke interception placeholder is active.
        </div>
      </div>
    </div>
  );
};
