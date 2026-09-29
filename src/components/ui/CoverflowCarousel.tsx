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
  
  const requestRef = useRef<number>(0);
  
  // Physics and interaction state
  const progress = useRef(0);
  const targetProgress = useRef(0);
  const isDragging = useRef(false);
  const isHoveringCard = useRef(false);
  
  // Drag physics states
  const dragStartX = useRef(0);
  const dragStartProgress = useRef(0);
  const dragLastX = useRef(0);
  const dragLastTime = useRef(0);
  const velocity = useRef(0);
  const isFlicking = useRef(false);
  const interactionCooldown = useRef(0); // Pauses auto-scroll after interaction
  
  // Duplicating items for infinite loop (5 sets ensures plenty of runway)
  const duplicatedItems = [...items, ...items, ...items, ...items, ...items];
  const totalWidth = items.length * spacing;

  const animate = useCallback(() => {
    if (!isDragging.current) {
      if (isFlicking.current) {
        targetProgress.current += velocity.current;
        velocity.current *= 0.92; // Friction

        if (Math.abs(velocity.current) < 0.5) {
          isFlicking.current = false;
          // Magnetic Snap to nearest card
          const centerScreenX = containerWidth / 2;
          const idealIndex = Math.round((centerScreenX + (totalWidth * 2) - targetProgress.current) / spacing);
          targetProgress.current = centerScreenX + (totalWidth * 2) - (idealIndex * spacing);
          interactionCooldown.current = 150; // Pause auto-scroll for ~2.5s
        }
      } else {
        if (interactionCooldown.current > 0) {
          interactionCooldown.current--;
        } else if (!isHoveringCard.current) {
          // Auto-scroll resumes
          targetProgress.current += speed;
        }
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
      const zIndex = 100 - Math.abs(Math.round(normalizedDistance * 100));
      const translateZ = -Math.abs(normalizedDistance) * 250;

      const centerFactor = Math.max(0, 1 - Math.abs(normalizedDistance) / 0.15); // 0 to 1
      
      card.style.transform = `translateX(${currentX - centerScreenX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
      card.style.zIndex = zIndex.toString();
      card.style.opacity = "1"; // Todos los álbumes sólidos al 100%
      
      const inner = card.querySelector('.coverflow-inner') as HTMLDivElement;
      if (inner) {
        const baseScale = 1 - Math.abs(normalizedDistance) * 0.2;
        const targetScale = baseScale + centerFactor * 0.05; // Llega a 1.05 en el centro
        inner.style.transform = `scale(${targetScale})`;
        
        const img = inner.querySelector('img') as HTMLImageElement;
        if (img) {
          const shadowGlow = centerFactor * 0.1;
          const shadowOpacity = 0.5 + centerFactor * 0.1;
          img.style.boxShadow = `0 ${10 + centerFactor * 5}px 30px rgba(0,0,0,${shadowOpacity}), 0 0 ${centerFactor * 20}px rgba(255,255,255,${shadowGlow})`;
        }
        
        const info = inner.querySelector('.info-panel') as HTMLDivElement;
        if (info) {
          info.style.opacity = centerFactor.toString();
          info.style.transform = `translateX(-50%) translateY(${(1 - centerFactor) * 15}px)`;
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
    isFlicking.current = false;
    dragStartX.current = e.clientX;
    dragLastX.current = e.clientX;
    dragLastTime.current = performance.now();
    dragStartProgress.current = targetProgress.current;
    velocity.current = 0;
    interactionCooldown.current = 0;
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    const now = performance.now();
    const dt = now - dragLastTime.current;
    const dx = e.clientX - dragLastX.current;
    
    if (dt > 0) {
      // Calculate velocity (pixels per frame assuming 60fps)
      velocity.current = (dx / dt) * 16.6 * 1.5;
    }
    
    dragLastX.current = e.clientX;
    dragLastTime.current = now;

    const deltaX = e.clientX - dragStartX.current;
    // Drag exactly 1:1 visually
    targetProgress.current = dragStartProgress.current + deltaX * 1.5;
    progress.current = targetProgress.current; 
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
    
    // Trigger inertia/flicking or snap immediately if slow
    if (Math.abs(velocity.current) > 1) {
      isFlicking.current = true;
    } else {
      isFlicking.current = true;
      velocity.current = 0; // Will trigger snap instantly
    }
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
    interactionCooldown.current = 150; // Pause auto-scroll for ~2.5s
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
        }
        
        .coverflow-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translateZ(0);
        }
        
        .info-panel {
          position: absolute;
          bottom: -90px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          width: 300px;
          pointer-events: none;
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
