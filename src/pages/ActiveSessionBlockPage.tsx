import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Ban, MonitorX, LogOut, ArrowLeft } from 'lucide-react';

export const ActiveSessionBlockPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-rose-500/10 text-rose-500 mb-2">
            <Ban className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Concurrent Session Detected
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Institutional integrity policy prohibits running multiple active examination instances.
          </p>
        </div>

        <Card className="p-6 space-y-4 border-rose-500/30">
          <div className="flex items-start gap-3.5 p-4 rounded-lg bg-rose-500/5 border border-rose-500/20 text-xs">
            <MonitorX className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-rose-600 dark:text-rose-400 font-semibold block">
                Session Already Running on Another Machine
              </strong>
              <p className="text-muted-foreground leading-relaxed">
                An authenticated examination session is actively streaming telemetry from another workstation. You cannot initiate a second instance.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/50 border border-border space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Session ID:</span>
              <span className="font-mono text-foreground font-medium">
                {session?.sessionId || 'sess_active_node_99'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Workstation ID:</span>
              <span className="font-mono text-foreground font-medium">
                {session?.activeDeviceId || 'dev_workstation_primary'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-rose-500 font-semibold uppercase text-[10px] tracking-wider">
                Live & Locked
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              variant="destructive"
              size="lg"
              onClick={handleLogout}
              className="w-full gap-2"
            >
              <LogOut className="w-4 h-4" />
              Disconnect & Return to Login
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/system-check')}
              className="w-full gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to System Diagnostic
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

