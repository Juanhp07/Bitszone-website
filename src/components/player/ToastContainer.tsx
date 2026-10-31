import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useAnimationControls, useReducedMotion } from 'framer-motion';
import GlassSurface from '../ui/GlassSurface';

interface Toast {
  id: number;
  message: string;
  count: number;
}

const MAX_TOASTS = 3;
const LIFETIME_MS = 4500;

// forwardRef: AnimatePresence popLayout measures its children through their ref
const ToastPill = React.forwardRef<HTMLDivElement, { toast: Toast; reduce: boolean }>(({ toast, reduce }, ref) => {
  const pulse = useAnimationControls();
  const [settled, setSettled] = useState(false);

  // The same notice fired again: the pill gives a little bump instead of stacking a copy
  useEffect(() => {
    if (toast.count > 1 && !reduce) pulse.start({ scale: [1, 1.09, 0.97, 1], transition: { duration: 0.4 } });
  }, [toast.count]);

  return (
    <motion.div
      ref={ref}
      layout
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -26, scaleX: 0.16, scaleY: 0.5 }}
      animate={{ opacity: 1, y: 0, scaleX: 1, scaleY: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scaleX: 0.86, scaleY: 0.86, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } }}
      // drop falls in and wobbles as it settles; the width springs out from a small round blob
      transition={{ type: 'spring', stiffness: 230, damping: 17, mass: 0.8, opacity: { duration: 0.18 } }}
      onAnimationComplete={() => setSettled(true)}
      className="max-w-full"
    >
      <motion.div animate={pulse}>
        <GlassSurface
          // GlassSurface measures itself to build its refraction map; the drop starts scaled down, so it is
          // measured again (same size, different width keyword) once the animation has settled
          width={settled ? 'max-content' : 'fit-content'}
          height="fit-content"
          borderRadius={999}
          displace={4.5}
          blur={12}
          backgroundOpacity={0.16}
          saturation={1}
          distortionScale={-70}
          style={{ maxWidth: 'calc(100vw - 32px)', border: 'none', boxShadow: '0 12px 32px -8px rgba(0,0,0,0.5)' }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 60%), rgba(12,12,16,0.58)',
            }}
          />
          <motion.span
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.16, duration: 0.2 }}
            className="relative px-3 py-1 text-sm font-medium tracking-wide text-white text-center"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.35)' }}
          >
            {toast.message}
            {toast.count > 1 && <b className="ml-1.5 text-xs font-semibold opacity-80">×{toast.count}</b>}
          </motion.span>
        </GlassSurface>
      </motion.div>
    </motion.div>
  );
});

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastsRef = useRef<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    const commit = (next: Toast[]) => { toastsRef.current = next; setToasts(next); };
    const disarm = (id: number) => { clearTimeout(timers.current.get(id)); timers.current.delete(id); };
    const arm = (id: number) => {
      disarm(id);
      timers.current.set(id, setTimeout(() => {
        timers.current.delete(id);
        commit(toastsRef.current.filter((t) => t.id !== id));
      }, LIFETIME_MS));
    };

    const onShow = (e: Event) => {
      const message = (e as CustomEvent<string>).detail;
      if (!message) return;
      const current = toastsRef.current;
      const same = current.find((t) => t.message === message);
      if (same) {
        // same notice again while it is still on screen: count it and keep it alive
        arm(same.id);
        commit(current.map((t) => (t === same ? { ...t, count: t.count + 1 } : t)));
        return;
      }
      const id = Date.now() + Math.random();
      const next = [...current, { id, message, count: 1 }];
      next.slice(0, -MAX_TOASTS).forEach((t) => disarm(t.id)); // oldest ones leave when a 4th arrives
      arm(id);
      commit(next.slice(-MAX_TOASTS));
    };

    window.addEventListener('show-toast', onShow);
    return () => {
      window.removeEventListener('show-toast', onShow);
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, []);

  if (typeof document === 'undefined') return null;

  // Always mounted so the last notice can still play its exit animation
  return createPortal(
    <div
      className="fixed top-3 md:top-4 left-1/2 -translate-x-1/2 w-[min(calc(100vw-32px),640px)] z-[9999] flex flex-col gap-2 pointer-events-none items-center"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => (
          <ToastPill key={toast.id} toast={toast} reduce={reduce} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};
