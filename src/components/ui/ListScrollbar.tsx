import React, { useEffect, useRef, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';

// Thin draggable scrollbar for a custom scroll container. Shown only while the parent
// `group/list` is hovered; pulling past either end fires the container's rubber-band bounce.
export const ListScrollbar = ({
  containerRef,
  onBounce,
  springY,
  className = '',
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onBounce?: (edge: 'start' | 'end') => void;
  springY?: MotionValue<number>;
  className?: string;
}) => {
  const [thumb, setThumb] = useState({ top: 0, height: 0, visible: false });
  const drag = useRef<{ startY: number; startScroll: number; edge: 'start' | 'end' | null } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight + 1) { setThumb((t) => ({ ...t, visible: false })); return; }
      const height = Math.max(36, (clientHeight / scrollHeight) * clientHeight);
      setThumb({ visible: true, height, top: (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - height) });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
  }, [containerRef]);

  if (!thumb.visible) return null;

  const onThumbDown = (e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startScroll: el.scrollTop, edge: null };
  };
  const onThumbMove = (e: React.PointerEvent) => {
    const el = containerRef.current;
    const d = drag.current;
    if (!el || !d) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const travel = Math.max(1, el.clientHeight - thumb.height);
    const next = d.startScroll + (e.clientY - d.startY) * (maxScroll / travel);
    const edge = next < -12 ? 'start' : next > maxScroll + 12 ? 'end' : null;
    if (edge && edge !== d.edge) onBounce?.(edge);
    d.edge = edge;
    el.scrollTop = Math.min(maxScroll, Math.max(0, next));
  };
  const onThumbUp = () => { drag.current = null; };
  const onTrackDown = (e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el || e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientY - rect.top - thumb.height / 2) / Math.max(1, rect.height - thumb.height);
    el.scrollTo({ top: ratio * (el.scrollHeight - el.clientHeight), behavior: 'smooth' });
  };

  return (
    <div
      onPointerDown={onTrackDown}
      className={`group/track absolute w-3 flex justify-center cursor-pointer z-10 opacity-0 group-hover/list:opacity-100 has-[:active]:opacity-100 transition-opacity duration-300 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-y-0 w-[3px] rounded-full bg-white/10 group-hover/track:w-[5px] transition-[width]" />
      <motion.div
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={onThumbUp}
        onPointerCancel={onThumbUp}
        className="group/thumb absolute w-3 flex justify-center cursor-grab active:cursor-grabbing touch-none"
        style={{ top: thumb.top, height: thumb.height, y: springY }}
      >
        <span className="w-[3px] group-hover/track:w-[5px] h-full rounded-full bg-white/45 group-hover/thumb:bg-white/70 group-active/thumb:bg-white/85 transition-[width,background-color]" />
      </motion.div>
    </div>
  );
};
