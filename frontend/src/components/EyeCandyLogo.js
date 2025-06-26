import React from 'react';

export const EyeCandyLogo = ({ className = "h-16 w-auto", showText = true }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Interlocked Hearts Logo */}
      <svg 
        width="120" 
        height="80" 
        viewBox="0 0 120 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="mb-2"
      >
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="heartGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="heartGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="50%" stopColor="#C026D3" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          
          {/* 3D effect filters */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* First Heart (Red to Pink) */}
        <path
          d="M25 35 C25 25, 35 20, 45 25 C55 20, 65 25, 65 35 C65 50, 45 65, 45 65 C45 65, 25 50, 25 35 Z"
          fill="url(#heartGradient1)"
          filter="url(#shadow)"
          transform="rotate(-15 45 40)"
        />
        
        {/* Second Heart (Purple to Pink) */}
        <path
          d="M35 25 C35 15, 45 10, 55 15 C65 10, 75 15, 75 25 C75 40, 55 55, 55 55 C55 55, 35 40, 35 25 Z"
          fill="url(#heartGradient2)"
          filter="url(#shadow)"
          transform="rotate(15 55 30)"
        />
      </svg>
      
      {/* Text Logo */}
      {showText && (
        <div className="text-center">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-red-500 italic" style={{fontFamily: 'cursive'}}>
              Eye
            </span>
            <span className="text-2xl font-bold text-red-500 italic" style={{fontFamily: 'cursive'}}>
              Candy
            </span>
          </div>
          <div className="text-sm text-gray-600 italic mt-1" style={{fontFamily: 'cursive'}}>
            Unwrap Me
          </div>
        </div>
      )}
    </div>
  );
};

export default EyeCandyLogo;