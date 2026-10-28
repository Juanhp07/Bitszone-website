import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export type LiquidTab<T extends string> = { id: T; label: string; icon?: React.ReactNode; title?: string };

/**
 * Segmented control with an Apple-style liquid-glass lens. The lens sits ON TOP of the labels and
 * refracts them live (SVG displacement as a backdrop filter, Chromium), so whatever passes under it
 * bends like through glass. Press and slide: the lens follows the pointer, swells while held and
 * springs onto the nearest tab on release.
 */
export function LiquidTabs<T extends string>({
  tabs,
  value,
  onChange,
  className = '',
}: {
  tabs: LiquidTab<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  const filterId = `bz-lens-${useId().replace(/:/g, '')}`;
  const trackRef = useRef<HTMLDivElement>(null);
  const [segment, setSegment] = useState(0);
  const [pressed, setPressed] = useState(false);
  const drag = useRef<{ startX: number; startLeft: number; moved: boolean } | null>(null);

  const index = Math.max(0, tabs.findIndex((t) => t.id === value));
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 420, damping: 32, mass: 0.7 });

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setSegment(el.clientWidth / tabs.length);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tabs.length]);

  useEffect(() => { if (!drag.current) x.set(index * segment); }, [index, segment, x]);

  const nearest = (left: number) => Math.min(tabs.length - 1, Math.max(0, Math.round(left / Math.max(1, segment))));

  return (
    <div
      ref={trackRef}
      role="tablist"
      className={`relative grid touch-none select-none ${className}`}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      onPointerDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { startX: e.clientX, startLeft: e.clientX - rect.left - segment / 2, moved: false };
        setPressed(true);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        if (Math.abs(e.clientX - d.startX) > 3) d.moved = true;
        const left = d.startLeft + (e.clientX - d.startX);
        x.set(Math.min(segment * (tabs.length - 1), Math.max(0, left)));
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        setPressed(false);
        if (!d) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const target = d.moved ? nearest(x.get()) : Math.min(tabs.length - 1, Math.floor((e.clientX - rect.left) / Math.max(1, segment)));
        x.set(target * segment);
        if (tabs[target].id !== value) onChange(tabs[target].id);
      }}
      onPointerCancel={() => { drag.current = null; setPressed(false); x.set(index * segment); }}
    >
      {/* Refraction map for the lens: smooth noise displacement + a touch of blur */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <filter id={filterId} x="-20%" y="-50%" width="140%" height="200%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.018" numOctaves="1" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="3" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="7" xChannelSelector="R" yChannelSelector="G" result="bent" />
          <feGaussianBlur in="bent" stdDeviation="0.25" />
        </filter>
      </svg>

      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            title={t.title}
            // pointer handling lives on the track; keep keyboard activation
            onClick={(e) => { if (e.detail === 0) onChange(t.id); }}
            className={`relative z-0 flex items-center justify-center py-2 md:py-2.5 px-1 sm:px-1.5 text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-[0.12em] sm:tracking-[0.15em] md:tracking-[0.18em] indent-[0.12em] sm:indent-[0.15em] md:indent-[0.18em] uppercase rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 cursor-pointer ${active ? 'text-white font-bold' : 'text-white/60 hover:text-white/90'}`}
          >
            {t.icon}
            <span className="truncate">{t.label}</span>
          </button>
        );
      })}

      {/* The lens: above the labels, bending them live */}
      <motion.div
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0 z-10 rounded-full pointer-events-none border border-white/25 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_16px_rgba(0,0,0,0.3)]"
        style={{
          width: segment || `${100 / tabs.length}%`,
          x: springX,
          backdropFilter: `url(#${filterId}) saturate(1.6) brightness(1.15)`,
          WebkitBackdropFilter: 'blur(12px) saturate(1.6) brightness(1.15)',
        }}
        animate={{ scaleX: pressed ? 1.08 : 1, scaleY: pressed ? 1.12 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />
    </div>
  );
}
