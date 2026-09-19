import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

export interface SpecularTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  specularColor?: string;
  baseStrokeColor?: string;
  strokeWidth?: number;
  glowSize?: number;
}

export const SpecularText: React.FC<SpecularTextProps> = ({ 
  text, 
  className = "", 
  style = {},
  specularColor = "#FF9FFC",
  baseStrokeColor = "transparent",
  strokeWidth = 1.5,
  glowSize = 60
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={style}
    >
      {/* 1. Base Text (Solid with permanent border) */}
      <span 
        className="relative z-20 text-white"
        style={{
          WebkitTextStroke: `${strokeWidth}px ${baseStrokeColor}`,
        }}
      >
        {text}
      </span>

      {/* 2. The Specular Hover Outline Layer (z-30 so it draws over the base border) */}
      <motion.span
        aria-hidden="true"
        className="absolute top-0 left-0 z-30 w-full h-full pointer-events-none select-none bg-clip-text text-transparent"
        style={{
          WebkitTextStroke: `${strokeWidth}px transparent`,
          backgroundImage: useMotionTemplate`radial-gradient(${glowSize}px circle at ${mouseX}px ${mouseY}px, white 0%, ${specularColor} 25%, transparent 100%)`,
          opacity: isHovered ? 1 : 0,
        }}
      >
        {text}
      </motion.span>
    </div>
  );
};
