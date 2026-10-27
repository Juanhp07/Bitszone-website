import React from 'react';

// "Now playing" equalizer: bars breathe smoothly at different rhythms while playing,
// and settle to short stubs when paused.
export const EqBars = ({ playing, className = '', barClassName = 'w-[3px] bg-[#e9d5ff]' }: {
  playing: boolean;
  className?: string;
  barClassName?: string;
}) => (
  <div className={`flex items-end justify-center gap-[3px] shrink-0 ${className}`} aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <span
        key={i}
        className={`eq-bar h-full rounded-full ${barClassName}`}
        style={{
          animationDelay: `${[-0.2, -0.65, -0.35, -0.9][i]}s`,
          animationDuration: `${[0.9, 1.15, 0.8, 1.05][i]}s`,
          // Paused: drop the animation so the bars ease down to short stubs
          animationName: playing ? undefined : 'none',
          transform: playing ? undefined : 'scaleY(0.25)',
        }}
      />
    ))}
  </div>
);
