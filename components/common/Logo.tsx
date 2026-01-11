import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 64 }) => {
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg"
      >
        <rect 
          x="5" y="5" width="90" height="90" rx="28" 
          fill="var(--md-primary-container)" 
        />
        
        <g opacity="0.4">
          <rect x="15" y="10" width="10" height="8" rx="2" fill="var(--md-on-primary-container)" />
          <rect x="35" y="10" width="10" height="8" rx="2" fill="var(--md-on-primary-container)" />
          <rect x="55" y="10" width="10" height="8" rx="2" fill="var(--md-on-primary-container)" />
          <rect x="75" y="10" width="10" height="8" rx="2" fill="var(--md-on-primary-container)" />
          
          <rect x="15" y="82" width="10" height="8" rx="2" fill="var(--md-on-primary-container)" />
          <rect x="35" y="82" width="10" height="8" rx="2" fill="var(--md-on-primary-container)" />
          <rect x="55" y="82" width="10" height="8" rx="2" fill="var(--md-on-primary-container)" />
          <rect x="75" y="82" width="10" height="8" rx="2" fill="var(--md-on-primary-container)" />
        </g>

        <rect 
          x="22" y="25" width="56" height="50" rx="8" 
          fill="var(--md-primary)" 
          className="animate-pulse"
          style={{ animationDuration: '3s' }}
        />
        
        <path 
          d="M32 38L38 62L44 48L50 62L56 38" 
          stroke="var(--md-on-primary)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        <circle 
          cx="75" cy="30" r="14" 
          fill="var(--md-secondary-container)" 
          stroke="var(--md-primary)"
          strokeWidth="2"
        />
        <path 
          d="M68 30L73 35L82 25" 
          stroke="var(--md-primary)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        <rect x="32" y="68" width="36" height="3" rx="1.5" fill="var(--md-on-primary)" fillOpacity="0.5" />
      </svg>
    </div>
  );
};