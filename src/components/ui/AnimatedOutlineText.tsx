import React from 'react';

export const AnimatedOutlineText = ({
  text,
  className = "",
  strokeWidth = 2.5,
}: {
  text: string;
  className?: string;
  strokeWidth?: number;
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        className="w-full overflow-visible"
        viewBox="0 0 1000 120"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="animated-gradient" x1="0%" y1="0%" x2="200%" y2="0%">
            <stop offset="0%" stopColor="#2e1065" />   {/* Dark purple */}
            <stop offset="20%" stopColor="#8b5cf6" />  {/* Violet */}
            <stop offset="40%" stopColor="#c084fc" />  {/* Light purple */}
            <stop offset="60%" stopColor="#f59e0b" />  {/* Warm orange */}
            <stop offset="80%" stopColor="#fef08a" />  {/* Yellow */}
            <stop offset="100%" stopColor="#2e1065" /> {/* Back to dark purple */}
            
            <animate
              attributeName="x1"
              values="0%;-100%"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values="200%;100%"
              dur="5s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="transparent"
          stroke="url(#animated-gradient)"
          strokeWidth={strokeWidth}
          className="font-sans font-bold"
          style={{ fontSize: "90px", letterSpacing: "-0.02em" }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
};
