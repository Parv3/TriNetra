import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const styles = {
    default: 'bg-secondary text-secondary-foreground',
    success: 'bg-success/15 text-emerald-600 dark:text-emerald-400 border border-success/30',
    warning: 'bg-warning/15 text-amber-600 dark:text-amber-400 border border-warning/30',
    destructive: 'bg-destructive/15 text-rose-600 dark:text-rose-400 border border-destructive/30',
    outline: 'border border-border text-foreground',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

