import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const TrinetraLogo: React.FC<Props> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-extrabold',
    xl: 'text-3xl font-extrabold',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Third Eye in Gradient Ring */}
      <div className={`relative ${dimensions[size]} flex items-center justify-center shrink-0`}>
        {/* Gradient ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#5B4BFF] via-[#19D3F3] to-[#FF4D9D] p-[2px] shadow-sm">
          <div className="w-full h-full bg-background rounded-full" />
        </div>

        {/* Geometric Eye Icon with animated blink */}
        <div className="relative w-[65%] h-[65%] flex items-center justify-center animate-blink origin-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#trinetra-grad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="trinetra-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5B4BFF" />
                <stop offset="100%" stopColor="#19D3F3" />
              </linearGradient>
            </defs>
            {/* Eye contour */}
            <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" />
            {/* Pupil / Third eye iris */}
            <circle cx="12" cy="12" r="3.2" fill="#5B4BFF" stroke="#19D3F3" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {showText && (
        <span className={`font-heading tracking-tight ${textSizes[size]}`}>
          <span className="text-foreground">Tri</span>
          <span className="text-[#5B4BFF]">netra</span>
        </span>
      )}
    </div>
  );
};

