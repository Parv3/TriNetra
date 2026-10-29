import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemCheckStore } from '@/stores/systemCheckStore';
import { CheckItem } from '@/components/system-check/CheckItem';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ShieldCheck, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';

export const SystemCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const { checks, isCheckingAll, allPassed, runAllChecks, retryCheck } = useSystemCheckStore();

  useEffect(() => {
    // Run all checks automatically upon mounting
    runAllChecks();
  }, []);

  const handleContinue = () => {
    if (allPassed) {
      navigate('/consent');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            System & Environment Diagnostic
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Before entering the secure examination sandbox, verify that your workstation hardware and display environment meet compliance requirements.
          </p>
        </div>

        {/* Diagnostics List */}
        <Card className="space-y-3.5 divide-y divide-border/40 p-5">
          {Object.values(checks).map((item) => (
            <div key={item.id} className="pt-3.5 first:pt-0">
              <CheckItem item={item} onRetry={() => retryCheck(item.id)} />
            </div>
          ))}
        </Card>

        {/* Overall Status & Next Steps */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            variant="outline"
            onClick={runAllChecks}
            disabled={isCheckingAll}
            className="w-full sm:w-auto gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isCheckingAll ? 'animate-spin' : ''}`} />
            Run All Checks Again
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            disabled={!allPassed || isCheckingAll}
            className="w-full sm:w-auto gap-2"
          >
            Proceed to Rules & Consent
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {!allPassed && !isCheckingAll && (
          <div className="flex items-center gap-2 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              All diagnostic checks must pass before starting the assessment. Please disconnect auxiliary screens and permit device hardware access.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

