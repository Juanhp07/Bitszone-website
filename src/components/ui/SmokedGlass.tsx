import React from 'react';

/**
 * Background for "smoked glass" pills: the album art blurred beyond recognition under a dark veil,
 * so the pill is dark but tinted with the album's colours. Put it as the first child of an element
 * with `relative isolate overflow-hidden` (and a radius); give the content siblings `relative z-10`.
 */
export const SmokedGlass = ({
  src,
  veil = 'strong',
}: {
  src: string;
  veil?: 'strong' | 'soft' | 'light' | 'white';
}) => {
  const isLight = veil === 'light' || veil === 'white';

  return (
    <span
      aria-hidden="true"
      className={`absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[inherit] ${
        isLight ? 'bg-white/[0.18]' : 'bg-black/40'
      }`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover scale-[2.5] blur-2xl ${
            isLight ? 'saturate-[1.8] opacity-60' : 'saturate-[1.6]'
          }`}
        />
      ) : null}
      <span
        className={`absolute inset-0 ${
          isLight
            ? 'bg-[radial-gradient(120%_160%_at_50%_0%,rgba(255,255,255,0.30),rgba(255,255,255,0.08))]'
            : veil === 'strong'
            ? 'bg-[radial-gradient(120%_160%_at_50%_0%,rgba(0,0,0,0.5),rgba(0,0,0,0.82))]'
            : 'bg-[radial-gradient(120%_160%_at_30%_0%,rgba(0,0,0,0.45),rgba(0,0,0,0.72))]'
        }`}
      />
    </span>
  );
};
