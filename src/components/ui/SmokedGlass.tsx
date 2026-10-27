import React from 'react';

/**
 * Background for "smoked glass" pills: the album art blurred beyond recognition under a dark veil,
 * so the pill is dark but tinted with the album's colours. Put it as the first child of an element
 * with `relative isolate overflow-hidden` (and a radius); give the content siblings `relative z-10`.
 */
export const SmokedGlass = ({ src, veil = 'strong' }: { src: string; veil?: 'strong' | 'soft' }) => (
  <span aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[inherit]">
    <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover scale-[2.5] blur-2xl saturate-[1.6]" />
    <span
      className={`absolute inset-0 ${veil === 'strong'
        ? 'bg-[radial-gradient(120%_160%_at_50%_0%,rgba(0,0,0,0.5),rgba(0,0,0,0.82))]'
        : 'bg-[radial-gradient(120%_160%_at_30%_0%,rgba(0,0,0,0.45),rgba(0,0,0,0.72))]'}`}
    />
  </span>
);
