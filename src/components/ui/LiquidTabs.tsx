import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export type LiquidTab<T extends string> = { id: T; label: string; icon?: React.ReactNode; title?: string };

/**
 * Segmented control estilo Liquid Glass con indicador deslizante suave y texto 100% nítido.
 * El indicador corre por detrás del texto para que las letras nunca se distorsionen ni se vean borrosas.
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [segment, setSegment] = useState(0);
  const [pressed, setPressed] = useState(false);
  const drag = useRef<{ startX: number; startLeft: number; moved: boolean } | null>(null);

  const hasActive = tabs.some((t) => t.id === value);
  const activeIndex = tabs.findIndex((t) => t.id === value);
  const index = activeIndex >= 0 ? activeIndex : 0;
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
      {/* Indicador activo estilo Liquid Glass (detrás del texto para nitidez absoluta sin distorsión) */}
      <motion.div
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0 z-0 rounded-full pointer-events-none border border-white/25 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-md transition-opacity duration-200"
        style={{
          width: segment || `${100 / tabs.length}%`,
          x: springX,
          opacity: hasActive ? 1 : 0,
        }}
        animate={{ scaleX: pressed ? 1.05 : 1, scaleY: pressed ? 1.08 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />

      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            title={t.title}
            onClick={(e) => { if (e.detail === 0) onChange(t.id); }}
            className={`relative z-10 flex items-center justify-center py-2 md:py-2.5 px-2 text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-[0.08em] sm:tracking-[0.1em] md:tracking-[0.14em] uppercase rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 cursor-pointer select-none ${
              active ? 'text-white font-bold' : 'text-white/60 hover:text-white/90'
            }`}
          >
            {t.icon}
            <span className="whitespace-nowrap">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
