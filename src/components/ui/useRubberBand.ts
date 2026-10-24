import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

interface UseRubberBandOptions {
  axis?: 'x' | 'y';
  maxBounce?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  customRef?: React.RefObject<HTMLDivElement | null>;
}

export function useRubberBand({
  axis = 'y',
  maxBounce = 36,
  stiffness = 300,
  damping = 18,
  mass = 0.7,
  customRef,
}: UseRubberBandOptions = {}) {
  const localRef = useRef<HTMLDivElement>(null);
  const containerRef = customRef || localRef;
  const bounceValue = useMotionValue(0);
  const springValue = useSpring(bounceValue, { stiffness, damping, mass });

  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollPosRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());
  const isBouncingRef = useRef(false);
  const touchStartRef = useRef(0);
  const isTouchingRef = useRef(false);

  const triggerBounce = useCallback((direction: 'start' | 'end') => {
    const amount = direction === 'start' ? 24 : -24;
    bounceValue.set(amount);
    setTimeout(() => {
      bounceValue.set(0);
    }, 45);
  }, [bounceValue]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const delta = axis === 'y' 
      ? e.deltaY 
      : (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0));

    if (Math.abs(delta) < 0.5) return;

    const scrollPos = axis === 'y' ? container.scrollTop : container.scrollLeft;
    const clientDim = axis === 'y' ? container.clientHeight : container.clientWidth;
    const scrollDim = axis === 'y' ? container.scrollHeight : container.scrollWidth;
    const maxScroll = Math.max(0, scrollDim - clientDim);

    if (delta < 0 && scrollPos <= 1) {
      const current = bounceValue.get();
      const next = Math.min(maxBounce, current + Math.abs(delta) * 0.22);
      bounceValue.set(next);

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        bounceValue.set(0);
      }, 75);
    } else if (delta > 0 && scrollPos >= maxScroll - 2) {
      const current = bounceValue.get();
      const next = Math.max(-maxBounce, current - Math.abs(delta) * 0.22);
      bounceValue.set(next);

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        bounceValue.set(0);
      }, 75);
    }
  }, [axis, maxBounce, bounceValue]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isTouchingRef.current) return;

    const scrollPos = axis === 'y' ? container.scrollTop : container.scrollLeft;
    const clientDim = axis === 'y' ? container.clientHeight : container.clientWidth;
    const scrollDim = axis === 'y' ? container.scrollHeight : container.scrollWidth;
    const maxScroll = Math.max(0, scrollDim - clientDim);

    const now = Date.now();
    const dt = Math.max(1, now - lastScrollTimeRef.current);
    const dPos = scrollPos - lastScrollPosRef.current;
    const speed = Math.abs(dPos / dt);

    lastScrollPosRef.current = scrollPos;
    lastScrollTimeRef.current = now;

    if (!isBouncingRef.current && speed > 0.45) {
      if (scrollPos <= 0 && dPos < 0) {
        isBouncingRef.current = true;
        triggerBounce('start');
        setTimeout(() => { isBouncingRef.current = false; }, 350);
      } else if (scrollPos >= maxScroll - 1 && dPos > 0) {
        isBouncingRef.current = true;
        triggerBounce('end');
        setTimeout(() => { isBouncingRef.current = false; }, 350);
      }
    }
  }, [axis, triggerBounce]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = axis === 'y' ? e.touches[0].pageY : e.touches[0].pageX;
    isTouchingRef.current = true;
  }, [axis]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTouchingRef.current || e.touches.length !== 1) return;
    const container = containerRef.current;
    if (!container) return;

    const currentPos = axis === 'y' ? e.touches[0].pageY : e.touches[0].pageX;
    const diff = currentPos - touchStartRef.current;

    const scrollPos = axis === 'y' ? container.scrollTop : container.scrollLeft;
    const clientDim = axis === 'y' ? container.clientHeight : container.clientWidth;
    const scrollDim = axis === 'y' ? container.scrollHeight : container.scrollWidth;
    const maxScroll = Math.max(0, scrollDim - clientDim);

    if (diff > 0 && scrollPos <= 0) {
      const rubber = Math.min(maxBounce, (diff * 0.42) / (1 + diff * 0.007));
      bounceValue.set(rubber);
    } else if (diff < 0 && scrollPos >= maxScroll) {
      const over = -diff;
      const rubber = Math.min(maxBounce, (over * 0.42) / (1 + over * 0.007));
      bounceValue.set(-rubber);
    } else {
      bounceValue.set(0);
    }
  }, [axis, maxBounce, bounceValue]);

  const handleTouchEnd = useCallback(() => {
    isTouchingRef.current = false;
    bounceValue.set(0);
  }, [bounceValue]);

  return {
    containerRef,
    bounceValue,
    springValue,
    triggerBounce,
    scrollProps: {
      onWheel: handleWheel,
      onScroll: handleScroll,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    }
  };
}
