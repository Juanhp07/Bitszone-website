import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ScrollableList = ({ children, chevronTop }: { children: React.ReactNode, chevronTop?: number }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeft(scrollLeft > 5);
    setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => checkScroll());
    observer.observe(container);

    // Also observe children to detect changes in content
    Array.from(container.children).forEach(child => {
      observer.observe(child);
    });

    window.addEventListener('resize', checkScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
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
          aria-label="Anterior"
          className={`hidden md:block absolute left-0 -translate-x-[40%] z-20 p-0 text-white/[0.15] hover:text-white/60 transition-all duration-300 hover:scale-110 ${!chevronTop ? "top-1/2 -translate-y-1/2" : ""}`}
          style={chevronTop ? { top: `${chevronTop}px`, transform: `translate(-40%, -50%)` } : undefined}
        >
          <ChevronLeft className="w-14 h-14 drop-shadow-md scale-y-[1.15]" strokeWidth={2.5} />
        </button>
      )}
      
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-3 md:gap-6 overflow-x-auto overscroll-x-contain pb-4 md:pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth -mx-4 px-4 scroll-px-4 md:mx-0 md:px-0 md:scroll-px-0" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitMaskImage: getMaskImage(), maskImage: getMaskImage(), transition: 'mask-image 0.3s ease' }}
      >
        {children}
      </div>

      {showRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Siguiente"
          className={`hidden md:block absolute right-0 translate-x-[40%] z-20 p-0 text-white/[0.15] hover:text-white/60 transition-all duration-300 hover:scale-110 ${!chevronTop ? "top-1/2 -translate-y-1/2" : ""}`}
          style={chevronTop ? { top: `${chevronTop}px`, transform: `translate(40%, -50%)` } : undefined}
        >
          <ChevronRight className="w-14 h-14 drop-shadow-md scale-y-[1.15]" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
