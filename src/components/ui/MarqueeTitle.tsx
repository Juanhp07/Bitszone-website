import React from 'react';
import type { ReactNode } from 'react';

/** One-line title: if it does not fit it scrolls back and forth (always when `active`, otherwise while the parent `.group` is hovered). `center` centres it when it does fit. */
export const MarqueeTitle = ({ text = '', children, measureKey, active = false, center = false, slideOnHover = false }: {
  text?: string; active?: boolean; center?: boolean;
  /** custom content instead of `text` (then pass `measureKey` so the width is re-measured when it changes) */
  children?: ReactNode; measureKey?: string | number;
  /** hover slides the text to its end, and letting go eases it back (instead of looping and snapping back) */
  slideOnHover?: boolean;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [overflowAmount, setOverflowAmount] = React.useState(0);

  React.useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const cWidth = containerRef.current.clientWidth;
        const tWidth = textRef.current.scrollWidth;
        if (tWidth > cWidth) {
          setIsOverflowing(true);
          setOverflowAmount(tWidth - cWidth + 30); // 30px extra padding so it scrolls past the last letter
        } else {
          setIsOverflowing(false);
          setOverflowAmount(0);
        }
      }
    };
    checkOverflow();
    setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text, measureKey]);

  return (
    <div ref={containerRef} className="overflow-hidden flex-1 relative px-4 -mx-4 py-4 -my-4" style={{ maskImage: 'linear-gradient(to right, transparent 0px, black 16px, black calc(100% - 16px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 16px, black calc(100% - 16px), transparent 100%)' }}>
      <div
        className={`whitespace-nowrap ${isOverflowing ? (active ? 'animate-marquee-pingpong' : slideOnHover ? 'marquee-slide' : 'marquee-on-hover') : center ? 'text-center' : ''}`}
        style={isOverflowing ? { '--overflow-amount': `-${overflowAmount}px`, '--slide-duration': `${Math.max(1.5, overflowAmount / 160)}s` } as React.CSSProperties : {}}
      >
        <span ref={textRef} className="inline-block truncate-none">
          {children ?? text}
        </span>
      </div>
    </div>
  );
};
