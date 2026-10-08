
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", variant = 'icon' }) => {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        {/* Background rounded square */}
        <rect width="100" height="100" rx="28" fill="url(#logoGradient)" />
        
        <ellipse cx="54" cy="36" rx="22" ry="9" fill="white" transform="rotate(-35 54 36)" />
        <ellipse cx="47" cy="53" rx="17" ry="7" fill="white" transform="rotate(-35 47 53)" />
        <ellipse cx="40" cy="68" rx="11" ry="4.5" fill="white" transform="rotate(-35 40 68)" />
      </svg>
    </div>
  );
};

export default Logo;
