import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-card text-card-foreground border border-border rounded-lg p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

