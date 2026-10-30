import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import GlassSurface from './GlassSurface';

export type LiquidTab<T extends string> = { id: T; label: string; icon?: React.ReactNode; title?: string };

/**
 * Segmented control estilo Liquid Glass con indicador deslizante suave.
 * El indicador es un lente de cristal que pasa por encima del texto y lo refracta, como las notificaciones.
 */
export function LiquidTabs<T extends string>({
  tabs,
  value,
  onChange,
  className = '',
  tabClassName = 'py-2 md:py-2.5 px-2',
}: {
  tabs: LiquidTab<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  tabClassName?: string;
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
      {/* Liquid glass lens over the labels, same glass as the notifications: it bends the letters under it,
          tinted dark so the album colour shows through. Little blur here: the label sits behind the glass. */}
      <motion.div
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0 z-20 rounded-full overflow-hidden pointer-events-none transition-[opacity,top,bottom,left,width] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          // held = a bit smaller (resized, not scaled: scaling a clipped glass layer breaks Chrome's rounded crop)
          width: segment ? segment - (pressed ? 10 : 0) : `${100 / tabs.length}%`,
          top: pressed ? 3 : 0,
          bottom: pressed ? 3 : 0,
          left: pressed ? 5 : 0,
          x: springX,
          opacity: hasActive ? 1 : 0,
        }}
      >
        {/* gentler than the notifications: the lens is short and the label sits right under it, so strong bending or colour split would make it unreadable */}
        {/* short reach (-22) + 7px of cropped ring: at the first/last tab the lens touches the bar's curved end,
            and a longer reach pulled that curve and the dark outside into the lens as a notch */}
        <div className="absolute -inset-[7px]">
          <GlassSurface width="100%" height="100%" borderRadius={999} displace={0.6} blur={5} backgroundOpacity={0} saturation={1.5} distortionScale={-22} greenOffset={0} blueOffset={0} />
        </div>
        <span
          className="pointer-events-none absolute inset-0 rounded-full"
          // light frosted fill over the album colour; pressing brightens it (scaling the lens on press
          // made Chrome lose the rounded crop and show the glass's dark outer ring)
          style={{
            background: `rgba(255,255,255,${pressed ? 0.24 : 0.16})`,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.18)',
            transition: 'background 200ms ease-out',
          }}
        />
      </motion.div>

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
            className={`relative z-10 flex items-center justify-center ${tabClassName} text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-[0.08em] sm:tracking-[0.1em] md:tracking-[0.14em] uppercase rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 cursor-pointer select-none ${
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
