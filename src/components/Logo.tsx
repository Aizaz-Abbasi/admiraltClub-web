import React from 'react';
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  const dimensions = sizeMap[size];
  return (
    <div
      className={`relative flex items-center justify-center ${dimensions} ${className}`}>
      
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-gold-500">
        
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="4" />
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4" />
        

        {/* Anchor */}
        <path
          d="M50 20 V80 M30 60 C30 75 40 80 50 80 C60 80 70 75 70 60 M25 60 H35 M65 60 H75 M40 30 H60"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round" />
        
        <circle
          cx="50"
          cy="20"
          r="6"
          stroke="currentColor"
          strokeWidth="4"
          fill="none" />
        

        {/* AC Monogram Background */}
        <rect x="35" y="40" width="30" height="20" fill="#0F1B2D" rx="4" />

        {/* AC Monogram Text */}
        <text
          x="50"
          y="55"
          fontFamily="serif"
          fontSize="18"
          fontWeight="bold"
          fill="currentColor"
          textAnchor="middle"
          letterSpacing="1">
          
          AC
        </text>
      </svg>
    </div>);

}