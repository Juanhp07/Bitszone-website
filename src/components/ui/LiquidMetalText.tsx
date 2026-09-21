"use client";

import React, { useId } from "react";
import { useMeasure } from "react-use";

interface LiquidMetalTextProps {
  text: string;
  className?: string;
  strokeWidth?: number;
  tintColor?: string; // Kept for compatibility with HeroSection props
}

export const LiquidMetalText = ({
  text,
  className = "",
  strokeWidth = 3,
}: LiquidMetalTextProps) => {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const scope = `gleam-text-${instanceId}`;

  // Colors
  const accentColor = "#FF9FFC"; // Bright Pink
  const accentSoftColor = "#ffffff"; // Intense White core
  const baseColor = "#5227FF"; // Deep Purple

  const css = `
    .${scope}-layer {
      --gleam-accent: ${accentColor};
      --gleam-accent-soft: ${accentSoftColor};
      --gleam-base: ${baseColor};

      position: absolute;
      inset: -10%; 
      
      /* RGB Gamer Keyboard Horizontal Wave! */
      background: linear-gradient(
        95deg,
        var(--gleam-base) 0%,
        var(--gleam-accent) 25%,
        var(--gleam-accent-soft) 50%,
        var(--gleam-accent) 75%,
        var(--gleam-base) 100%
      );
      background-size: 200% 100%;
      animation: keyboard-wave-${instanceId} 4s linear infinite;
      transition: opacity 0.8s ease;
    }

    .${scope}-text {
      color: transparent;
      -webkit-text-stroke: 1px rgba(255, 255, 255, 0.2);
      transition: color 0.4s ease, -webkit-text-stroke 0.4s ease, text-shadow 0.4s ease;
    }

    /* Fill and Breathe Effect on Hover */
    .${scope}-container:hover .${scope}-text {
      /* Fills the inside of the letters with a soft glow */
      color: rgba(255, 159, 252, 0.7); 
      /* Removes the static white border so it doesn't clash with the fill! */
      -webkit-text-stroke: 0px transparent;
      animation: text-breathe-${instanceId} 2s ease-in-out infinite alternate;
    }

    .${scope}-container:hover .${scope}-layer {
      /* Fades out the RGB border completely on hover! */
      opacity: 0;
    }

    @keyframes keyboard-wave-${instanceId} {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: 0% 0;
      }
    }

    @keyframes text-breathe-${instanceId} {
      0% {
        text-shadow: 0 0 15px rgba(255, 159, 252, 0.4), 0 0 30px rgba(82, 39, 255, 0.2);
      }
      100% {
        text-shadow: 0 0 25px rgba(255, 159, 252, 0.8), 0 0 50px rgba(82, 39, 255, 0.6);
      }
    }
  `;

  return (
    <div 
      ref={ref}
      className={`relative inline-flex items-center justify-center ${scope}-container ${className}`}
      style={{ lineHeight: 1.1 }}
    >
      <style>{css}</style>

      {/* 1. Base text that fills and breathes on hover */}
      <span 
        className={`${scope}-text whitespace-nowrap block relative z-0`}
      >
        {text}
      </span>

      {/* 2. SVG Mask Definition */}
      <svg 
        className="absolute pointer-events-none z-0 overflow-visible"
        style={{
          top: -40,
          left: -40,
          width: width > 0 ? width + 80 : '100%',
          height: height > 0 ? height + 80 : '100%',
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id={`mask-${instanceId}`}>
            <text 
              x="50%" 
              y="50%" 
              textAnchor="middle" 
              dominantBaseline="central" 
              fill="black" 
              stroke="white" 
              strokeWidth={strokeWidth * 1.5} // Thick stroke to let the gradient flow generously!
              className="font-sans font-bold"
            >
              {text}
            </text>
          </mask>
        </defs>
      </svg>

      {/* 3. The Spinning CSS Gradient Masked to the Text Stroke */}
      {width > 0 && height > 0 && (
        <div 
          className="absolute pointer-events-none z-10 mix-blend-screen"
          style={{
            top: -40,
            left: -40,
            width: width + 80,
            height: height + 80,
            WebkitMaskImage: `url(#mask-${instanceId})`,
            maskImage: `url(#mask-${instanceId})`,
            overflow: 'hidden',
          }}
        >
          <div className={`${scope}-layer`} />
        </div>
      )}
    </div>
  );
};
