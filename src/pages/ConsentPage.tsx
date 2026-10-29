import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import {
  FileText,
  Video,
  Keyboard,
  MousePointer,
  Globe,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Square,
} from 'lucide-react';

export const ConsentPage: React.FC = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const monitoringItems = [
    {
      icon: <Video className="w-5 h-5 text-primary" />,
      title: 'Continuous Webcam & Gaze Analysis',
      desc: 'Real-time AI tracks head orientation, face presence, and off-screen eye movements. Snapshots are archived for proctor audit.',
    },
    {
      icon: <Globe className="w-5 h-5 text-primary" />,
      title: 'Browser Navigation & AI Domain Tracking',
      desc: 'Tab switches and domain visits are logged. Visiting external AI assistance tools (e.g. ChatGPT, Claude, Copilot) triggers immediate violation flags.',
    },
    {
      icon: <Keyboard className="w-5 h-5 text-primary" />,
      title: 'Keystroke & Shortcut Surveillance',
      desc: 'Counts and shortcut patterns (Copy, Paste, DevTools) are audited to prevent automated script or clipboard injection.',
    },
    {
      icon: <MousePointer className="w-5 h-5 text-primary" />,
      title: 'Window Blur & Focus Tracking',
      desc: 'Leaving fullscreen mode, switching desktop workspaces, or backgrounding the test window increments your violation counter.',
    },
  ];

  const handleNext = () => {
    if (agreed) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Examination Rules & Monitoring Consent
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Please read the telemetry policy carefully. Anti-cheat instrumentation operates continuously during the test session.
          </p>
        </div>

        {/* Monitoring Cards */}
        <Card className="space-y-4 p-5">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
            What is Monitored
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {monitoringItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-border/60 bg-muted/30 flex items-start gap-3"
              >
                <div className="p-2 rounded-md bg-card border border-border/50 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">{item.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Warning Policy Alert */}
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 mt-4">
            <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
              <strong className="font-semibold block mb-0.5 text-rose-600 dark:text-rose-400">
                Disqualification Policy (3 Maximum Warnings)
              </strong>
              Any detected anomaly (absence from camera, secondary face, restricted AI domain access, or window blur) registers an audible warning. Reaching 3 violations leads to immediate disqualification and test termination.
            </div>
          </div>
        </Card>

        {/* Consent Checkbox */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setAgreed(!agreed)}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setAgreed(!agreed);
            }
          }}
          className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {agreed ? (
            <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          ) : (
            <Square className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          )}
          <span className="text-xs text-foreground font-medium leading-relaxed select-none">
            I understand and consent to video, audio, keystroke, and browser telemetry proctoring. I agree to comply with all examination regulations.
          </span>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/system-check')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Diagnostics
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={!agreed}
            className="gap-2"
          >
            Continue to Authentication
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

