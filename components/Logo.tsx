
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
        
        {/* Stylized White Waves */}
        <path 
          d="M60.5 39C62.5 37 57.5 33.5 50.5 34.5C43.5 35.5 33 42 33 42L41.5 51.5C41.5 51.5 52.5 47 60.5 39Z" 
          fill="white" 
        />
        <path 
          d="M58 52.5C60 50.5 56.5 48 51.5 48.5C46.5 49 39 53 39 53L43.5 59.5C43.5 59.5 51 59.5 58 52.5Z" 
          fill="white" 
        />
        <path 
          d="M54.5 63.5C56 62.5 53 60.5 49 61C45 61.5 40 64.5 40 64.5L43 69.5C43 69.5 49.5 68.5 54.5 63.5Z" 
          fill="white" 
        />
      </svg>
    </div>
  );
};

export default Logo;
