import React, { useRef, useState, useEffect } from 'react';
import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { useMeasure } from 'react-use';

export interface LiquidMetalTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
  tintColor?: string;
}

export const LiquidMetalText: React.FC<LiquidMetalTextProps> = ({ 
  text, 
  className = "", 
  style = {},
  strokeWidth = 3, 
  tintColor,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<any>(null);
  const [maskId] = useState(() => `mask-${Math.random().toString(36).substr(2, 9)}`);
  
  // Measure the exact pixel dimensions of the text container
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();

  // Keep ref in sync for the interval
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

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
            u_repetition: 4, // Restored default
            u_softness: 0.5,
            u_shiftRed: 0.6, 
            u_shiftBlue: 0.6, 
            u_distortion: 0.2, 
            u_contour: 0,
            u_angle: 45,
            u_scale: width / 15, // Restored default scale so the wave looks normal
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          2.5 // Start flowing immediately en lugar de empezar frenado
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

  // The 2-second Interval Wave Logic
  useEffect(() => {
    // Evita el bug de carga: Espera a que el componente esté medido en pantalla
    if (width === 0) return;

    let timeoutId: NodeJS.Timeout;
    
    const triggerWave = () => {
      if (!isHoveredRef.current && shaderMount.current?.setSpeed) {
        // Fast sweep (velocidad rápida como en el estado original)
        shaderMount.current.setSpeed(2.5);
        
        // El efecto dura exactamente 2 segundos
        timeoutId = setTimeout(() => {
          if (!isHoveredRef.current && shaderMount.current?.setSpeed) {
             shaderMount.current.setSpeed(0.1); // Frena casi por completo
          }
        }, 2000);
      }
    };

    // Trigger immediately
    triggerWave();
    
    // Repite cada 4 segundos (2s de duración de ola + 2s de pausa)
    const intervalId = setInterval(triggerWave, 4000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [width]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    shaderMount.current?.setSpeed?.(3.0); // Dynamic reaction on hover
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    shaderMount.current?.setSpeed?.(0.1); // Return to soft pause
  };

  return (
    <div 
      ref={ref}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, lineHeight: 1.1 }}
    >
      {/* 
        1. Faint Base Text 
        Provides a permanent ghost outline so the word is *always* legible.
        Increased opacity to 0.5 and stroke to 1.5px so it looks imposing and premium!
      */}
      <span 
        className="whitespace-nowrap block"
        style={{
          color: "transparent",
          WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.5)",
        }}
      >
        {text}
      </span>

      {/* 
        2. SVG Mask Definition 
        The SVG *must* have the exact same dimensions as the masked element.
      */}
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
            >
              {text}
            </text>
          </mask>
        </defs>
      </svg>

      {/* 
        3. The Liquid Metal WebGL Shader Layer 
        Uses mix-blend-screen so the dark parts of the metal disappear,
        leaving only the glowing bright liquid overlapping the ghost text.
      */}
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
          {/* Tint overlay adds the purple/plum tones while letting the screen blend keep it glowing */}
          {tintColor && (
            <div 
              className="absolute inset-0 w-full h-full mix-blend-overlay pointer-events-none" 
              style={{ backgroundColor: tintColor, opacity: 0.7 }} 
            />
          )}
        </div>
      )}
    </div>
  );
};
