import React from 'react';

// "Now playing" equalizer: bars breathe smoothly with independent rhythmic curves while playing,
// and gracefully ease down to short stubs when paused.
export const EqBars = ({ playing, className = '', barClassName = 'w-[3px] bg-[#e9d5ff]' }: {
  playing: boolean;
  className?: string;
  barClassName?: string;
}) => (
  <div className={`flex items-end justify-center gap-[3px] shrink-0 ${className}`} aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <span
        key={i}
        className={`eq-bar eq-bar-${i + 1} h-full rounded-full ${barClassName}`}
        style={{
          animationPlayState: playing ? 'running' : 'paused',
          transform: playing ? undefined : 'scaleY(0.25)',
        }}
      />
    ))}
  </div>
);
