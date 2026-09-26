import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ScrollableList = ({ children }: { children: React.ReactNode }) => {
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
    <div className="relative group">
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-[calc(50%-12px)] -translate-y-1/2 z-10 p-3 bg-black/80 hover:bg-black text-white rounded-full backdrop-blur-sm transition-all shadow-2xl opacity-90 hover:opacity-100 hover:scale-110 -ml-5 border border-white/10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitMaskImage: getMaskImage(), maskImage: getMaskImage(), transition: 'mask-image 0.3s ease' }}
      >
        {children}
      </div>

      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-[calc(50%-12px)] -translate-y-1/2 z-10 p-3 bg-black/80 hover:bg-black text-white rounded-full backdrop-blur-sm transition-all shadow-2xl opacity-90 hover:opacity-100 hover:scale-110 -mr-5 border border-white/10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
