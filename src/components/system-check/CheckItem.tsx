import React from 'react';
import { SystemCheckItem } from '@/stores/systemCheckStore';
import {
  Camera,
  Mic,
  Wifi,
  Monitor,
  Cast,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

interface Props {
  item: SystemCheckItem;
  onRetry: () => void;
}

export const CheckItem: React.FC<Props> = ({ item, onRetry }) => {
  const getIcon = () => {
    switch (item.id) {
      case 'camera':
        return <Camera className="w-5 h-5 text-primary" />;
      case 'microphone':
        return <Mic className="w-5 h-5 text-primary" />;
      case 'internet':
        return <Wifi className="w-5 h-5 text-primary" />;
      case 'display':
        return <Monitor className="w-5 h-5 text-primary" />;
      case 'screenMirroring':
        return <Cast className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusIcon = () => {
    switch (item.status) {
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'checking':
        return <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
        );
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-150 ${
        item.status === 'failed'
          ? 'border-rose-500/40 bg-rose-500/5'
          : item.status === 'passed'
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 bg-muted rounded-md shrink-0">{getIcon()}</div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">{item.name}</h4>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
          {item.message && (
            <p
              className={`text-xs mt-1.5 font-medium ${
                item.status === 'failed'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {item.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {getStatusIcon()}
        {item.status === 'failed' && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="text-xs h-8 gap-1.5"
            aria-label={`Retry ${item.name}`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};

