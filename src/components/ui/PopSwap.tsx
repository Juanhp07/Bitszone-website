import type { ReactNode } from 'react';

/**
 * Stacked icons that cross-fade with a small overshoot (pop): the one with `on` is shown, the others shrink away.
 * CSS only, so a swap never gets stuck halfway. Give it a size with `className` (e.g. "w-5 h-5").
 */
export const PopSwap = ({ items, className = 'w-5 h-5' }: { items: { id: string; on: boolean; node: ReactNode }[]; className?: string }) => (
  <span className={`relative inline-flex items-center justify-center ${className}`}>
    {items.map(({ id, on, node }) => (
      <span
        key={id}
        className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${on ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
      >
        {node}
      </span>
    ))}
  </span>
);
