import React, { useRef, useState, useEffect } from 'react';
import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { useMeasure } from 'react-use';

export interface LiquidMetalTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
  tintColor?: string; // Kept for interface compatibility but we don't use it anymore
}

export const LiquidMetalText: React.FC<LiquidMetalTextProps> = ({ 
  text, 
  className = "", 
  style = {},
  strokeWidth = 3, 
}) => {
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<any>(null);
  const [maskId] = useState(() => `mask-${Math.random().toString(36).substr(2, 9)}`);
  
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();

  useEffect(() => {
    const styleId = "shader-canvas-text-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container-text canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }

    if (width > 0 && height > 0 && shaderRef.current) {
      if (shaderMount.current?.destroy) {
        shaderMount.current.destroy();
      }

      try {
        shaderMount.current = new ShaderMount(
          shaderRef.current,
          liquidMetalFragmentShader,
          {
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            u_scale: 8,
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          0.8 // Fluid continuous speed without stops
        );
      } catch (error) {
        console.error("Failed to load text shader:", error);
      }
    }

    return () => {
      if (shaderMount.current?.destroy) {
        shaderMount.current.destroy();
        shaderMount.current = null;
      }
    };
  }, [width, height]);

  const handleMouseEnter = () => {
    shaderMount.current?.setSpeed?.(1.5);
  };

  const handleMouseLeave = () => {
    shaderMount.current?.setSpeed?.(0.8); 
  };

  return (
    <div 
      ref={ref}
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, lineHeight: 1.1 }}
    >
      <span 
        className="whitespace-nowrap block"
        style={{
          color: "transparent",
          WebkitTextStroke: "1px rgba(255, 255, 255, 0.2)", 
        }}
      >
        {text}
      </span>

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
          <mask id={maskId}>
            <text 
              x="50%" 
              y="50%" 
              textAnchor="middle" 
              dominantBaseline="central" 
              fill="black" 
              stroke="white" 
              strokeWidth={strokeWidth}
              className="font-sans font-bold"
            >
              {text}
            </text>
          </mask>
        </defs>
      </svg>

      {width > 0 && height > 0 && (
        <div 
          className="absolute pointer-events-none z-10 mix-blend-screen"
          style={{
            top: -40,
            left: -40,
            width: width + 80,
            height: height + 80,
            WebkitMaskImage: `url(#${maskId})`,
            maskImage: `url(#${maskId})`,
          }}
        >
          <div 
            ref={shaderRef} 
            className="w-full h-full shader-container-text relative" 
          />
        </div>
      )}
    </div>
  );
};
