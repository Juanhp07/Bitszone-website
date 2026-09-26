"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useMeasure } from 'react-use';

export type CoverflowItem = {
  src: string;
  alt: string;
  title: string;
  artist: string;
  color: string;
};

interface CoverflowCarouselProps {
  items: CoverflowItem[];
  speed?: number;
  spacing?: number;
}

export const CoverflowCarousel: React.FC<CoverflowCarouselProps> = ({
  items,
  speed = 1.0,
  spacing = 220,
}) => {
  const [containerRef, { width: containerWidth }] = useMeasure<HTMLDivElement>();
  
  const requestRef = useRef<number>();
  
  // Physics and interaction state
  const progress = useRef(0);
  const targetProgress = useRef(0);
  const isDragging = useRef(false);
  const isHoveringCard = useRef(false);
  const dragStartX = useRef(0);
  const dragStartProgress = useRef(0);
  
  // Duplicating items for infinite loop (5 sets ensures plenty of runway)
  const duplicatedItems = [...items, ...items, ...items, ...items, ...items];
  const totalWidth = items.length * spacing;

  const animate = useCallback(() => {
    if (!isDragging.current) {
      if (!isHoveringCard.current) {
        // Auto-scroll by increasing target (left to right)
        targetProgress.current += speed;
      }
      
      // Smoothly interpolate current progress towards target progress (Spring physics)
      progress.current += (targetProgress.current - progress.current) * 0.1;
    }

    // Infinite loop correction for BOTH current and target
    if (progress.current <= -totalWidth) {
      progress.current += totalWidth;
      targetProgress.current += totalWidth;
    } else if (progress.current > 0) {
      progress.current -= totalWidth;
      targetProgress.current -= totalWidth;
    }

    const centerScreenX = containerWidth / 2;
    const cards = document.querySelectorAll('.coverflow-card') as NodeListOf<HTMLDivElement>;
    
    cards.forEach((card, index) => {
      const itemBaseX = index * spacing;
      // Offset by 2 sets to start in the middle of our 5 sets
      let currentX = itemBaseX + progress.current - (totalWidth * 2); 
      
      // Keep cards looping visually if they go too far left/right
      if (currentX < -1000) currentX += totalWidth * 5;
      if (currentX > containerWidth + 1000) currentX -= totalWidth * 5;
      
      const distanceToCenter = currentX - centerScreenX;
      
      const maxDistance = 600;
      let normalizedDistance = Math.max(-1, Math.min(1, distanceToCenter / maxDistance));
      
      const rotateY = normalizedDistance * -65; 
      const scale = 1 - Math.abs(normalizedDistance) * 0.2;
      const zIndex = 100 - Math.abs(Math.round(normalizedDistance * 100));
      const opacity = 1 - Math.abs(normalizedDistance) * 0.8;
      const translateZ = -Math.abs(normalizedDistance) * 250;

      const isCenter = Math.abs(normalizedDistance) < 0.15;
      
      card.style.transform = `translateX(${currentX - centerScreenX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
      card.style.zIndex = zIndex.toString();
      card.style.opacity = isCenter ? "1" : Math.max(0, opacity).toString();
      
      const inner = card.querySelector('.coverflow-inner') as HTMLDivElement;
      if (inner) {
        const baseScale = 1 - Math.abs(normalizedDistance) * 0.2;
        const targetScale = isCenter ? 1.05 : baseScale;
        inner.style.transform = `scale(${targetScale})`;
        
        if (isCenter) {
          inner.classList.add('glow-active');
        } else {
          inner.classList.remove('glow-active');
        }
      }
    });

    requestRef.current = requestAnimationFrame(animate);
  }, [containerWidth, speed, spacing, totalWidth]);

  useEffect(() => {
    if (containerWidth > 0) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [containerWidth, animate]);

  // Dragging Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartProgress.current = targetProgress.current;
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartX.current;
    // Update both current and target to drag 1:1 instantly
    targetProgress.current = dragStartProgress.current + deltaX * 1.5;
    progress.current = targetProgress.current; 
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
  };

  // Center Card Handler
  const centerCard = (index: number) => {
    if (isDragging.current) return;
    
    // Calculate how far this card WILL BE from the center, and adjust targetProgress
    const itemBaseX = index * spacing;
    const futureX = itemBaseX + targetProgress.current - (totalWidth * 2);
    const centerScreenX = containerWidth / 2;
    const distanceToCenter = futureX - centerScreenX;
    
    targetProgress.current -= distanceToCenter;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[600px] flex items-center justify-center overflow-hidden [perspective:1000px] touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <style>{`
        .coverflow-card {
          position: absolute;
          left: 50%;
          top: 50%;
          margin-top: -200px;
          margin-left: -140px;
          width: 280px;
          height: 400px;
          transform-style: preserve-3d;
        }
        
        .coverflow-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          cursor: pointer;
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        /* Holographic Liquid Blur Aura */
        .coverflow-inner::before {
          content: '';
          position: absolute;
          inset: -15px;
          background: var(--card-color);
          filter: blur(35px);
          opacity: 0;
          transition: opacity 0.5s ease;
          border-radius: 20px;
          z-index: -1;
        }
        
        .coverflow-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          transition: box-shadow 0.4s ease;
        }
        
        .coverflow-inner.glow-active::before {
          opacity: 0.3; /* Liquid blur activates (reduced) */
        }
        
        .coverflow-inner.glow-active img {
          box-shadow: 0 0 20px rgba(255,255,255,0.1), 0 15px 30px rgba(0,0,0,0.6);
        }
        
        .info-panel {
          position: absolute;
          bottom: -70px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          width: 300px;
          opacity: 0;
          transition: opacity 0.4s ease, transform 0.4s ease;
          pointer-events: none;
        }
        
        .coverflow-inner.glow-active .info-panel {
          opacity: 1;
          transform: translateX(-50%) translateY(-10px);
        }
      `}</style>

      {duplicatedItems.map((item, index) => (
        <div 
          key={index}
          className="coverflow-card group"
          style={{ '--card-color': item.color } as React.CSSProperties}

          onClick={() => centerCard(index)}
        >
          <div className="coverflow-inner">
            <img src={item.src} alt={item.alt} draggable={false} />
            
            <div className="info-panel">
              <h3 className="text-white font-bold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{item.title}</h3>
              <p className="text-[#B497CF] font-medium text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{item.artist}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
