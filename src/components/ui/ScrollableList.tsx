import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ScrollableList = ({ children, chevronTop }: { children: React.ReactNode, chevronTop?: number }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // Motion value for Apple rubber-band & limit bounce
  const bounceX = useMotionValue(0);
  const springX = useSpring(bounceX, { stiffness: 320, damping: 18, mass: 0.7 });

  // Drag state refs
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Wheel & Momentum refs
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollLeftRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());
  const isBouncingRef = useRef(false);

  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeft(scrollLeft > 5);
    setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
  }, []);

  const triggerLimitBounce = useCallback((direction: 'left' | 'right') => {
    const amount = direction === 'left' ? 24 : -24;
    bounceX.set(amount);
    setTimeout(() => {
      bounceX.set(0);
    }, 45);
  }, [bounceX]);

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    const content = contentRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => checkScroll());
    observer.observe(container);
    if (content) {
      observer.observe(content);
    }

    window.addEventListener('resize', checkScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkScroll);
    };
  }, [children, checkScroll]);

  // Global mousemove and mouseup listeners so drag stays active even if mouse moves outside
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDownRef.current) return;
      const container = scrollContainerRef.current;
      if (!container) return;

      const diffX = e.pageX - startXRef.current;
      dragDistanceRef.current = Math.abs(diffX);

      if (Math.abs(diffX) > 4 && !isDragging) {
        setIsDragging(true);
      }

      const maxScroll = container.scrollWidth - container.clientWidth;
      const targetScroll = startScrollLeftRef.current - diffX;

      if (targetScroll < 0) {
        container.scrollLeft = 0;
        const over = -targetScroll;
        // Apple rubber-band resistance
        const rubber = Math.min(36, (over * 0.42) / (1 + over * 0.007));
        bounceX.set(rubber);
      } else if (targetScroll > maxScroll) {
        container.scrollLeft = maxScroll;
        const over = targetScroll - maxScroll;
        const rubber = Math.min(36, (over * 0.42) / (1 + over * 0.007));
        bounceX.set(-rubber);
      } else {
        container.scrollLeft = targetScroll;
        bounceX.set(0);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDownRef.current) {
        isDownRef.current = false;
        bounceX.set(0);
        setIsDragging(false);
        // Delay so click capture can prevent accidental clicks on cards
        setTimeout(() => {
          dragDistanceRef.current = 0;
        }, 60);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [bounceX, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    const container = scrollContainerRef.current;
    if (!container) return;

    isDownRef.current = true;
    startXRef.current = e.pageX;
    startScrollLeftRef.current = container.scrollLeft;
    dragDistanceRef.current = 0;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    // If user dragged to slide the carousel, cancel click event
    if (dragDistanceRef.current > 6) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (Math.abs(delta) < 0.5) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;

    if (delta < 0 && scrollLeft <= 1) {
      const current = bounceX.get();
      const next = Math.min(32, current + Math.abs(delta) * 0.24);
      bounceX.set(next);

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        bounceX.set(0);
      }, 75);
    } else if (delta > 0 && scrollLeft >= maxScroll - 2) {
      const current = bounceX.get();
      const next = Math.max(-32, current - Math.abs(delta) * 0.24);
      bounceX.set(next);

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        bounceX.set(0);
      }, 75);
    }
  };

  const handleScroll = () => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (!container || isDownRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;
    const now = Date.now();
    const dt = Math.max(1, now - lastScrollTimeRef.current);
    const dx = scrollLeft - lastScrollLeftRef.current;
    const speed = Math.abs(dx / dt);

    lastScrollLeftRef.current = scrollLeft;
    lastScrollTimeRef.current = now;

    // Boundary collision bounce when scrolling at high momentum
    if (!isBouncingRef.current && speed > 0.45) {
      if (scrollLeft <= 0 && dx < 0) {
        isBouncingRef.current = true;
        triggerLimitBounce('left');
        setTimeout(() => { isBouncingRef.current = false; }, 350);
      } else if (scrollLeft >= maxScroll - 1 && dx > 0) {
        isBouncingRef.current = true;
        triggerLimitBounce('right');
        setTimeout(() => { isBouncingRef.current = false; }, 350);
      }
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (direction === 'right') {
      if (currentScroll >= maxScroll - 5) {
        triggerLimitBounce('right');
        return;
      }
      const target = currentScroll + scrollAmount;
      if (target >= maxScroll - 15) {
        container.scrollTo({ left: maxScroll, behavior: 'smooth' });
        setTimeout(() => triggerLimitBounce('right'), 300);
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (currentScroll <= 5) {
        triggerLimitBounce('left');
        return;
      }
      const target = currentScroll - scrollAmount;
      if (target <= 15) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(() => triggerLimitBounce('left'), 300);
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const getMaskImage = () => {
    if (showLeft && showRight) {
      return 'linear-gradient(to right, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%)';
    } else if (showRight) {
      return 'linear-gradient(to right, black 0%, black calc(100% - 60px), transparent 100%)';
    } else if (showLeft) {
      return 'linear-gradient(to right, transparent 0px, black 60px, black 100%)';
    }
    return 'none';
  };

  return (
    <div className="relative">
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className={`absolute left-0 -translate-x-[40%] z-20 p-0 text-white/[0.15] hover:text-white/60 transition-all duration-300 hover:scale-110 ${!chevronTop ? "top-1/2 -translate-y-1/2" : ""}`}
          style={chevronTop ? { top: `${chevronTop}px`, transform: `translate(-40%, -50%)` } : undefined}
          aria-label="Anterior"
        >
          <ChevronLeft className="w-14 h-14 drop-shadow-md scale-y-[1.15]" strokeWidth={2.5} />
        </button>
      )}
      
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className={`overflow-x-auto pb-6 scrollbar-hide select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} 
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none', 
          WebkitMaskImage: getMaskImage(), 
          maskImage: getMaskImage(), 
          transition: 'mask-image 0.3s ease' 
        }}
      >
        <motion.div 
          ref={contentRef}
          style={{ x: springX }}
          className="flex gap-6 w-max min-w-full"
        >
          {children}
        </motion.div>
      </div>

      {showRight && (
        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 translate-x-[40%] z-20 p-0 text-white/[0.15] hover:text-white/60 transition-all duration-300 hover:scale-110 ${!chevronTop ? "top-1/2 -translate-y-1/2" : ""}`}
          style={chevronTop ? { top: `${chevronTop}px`, transform: `translate(40%, -50%)` } : undefined}
          aria-label="Siguiente"
        >
          <ChevronRight className="w-14 h-14 drop-shadow-md scale-y-[1.15]" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
