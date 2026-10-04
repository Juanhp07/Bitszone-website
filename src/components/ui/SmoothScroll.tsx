'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    } as any);

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const handleCustomScroll = (e: CustomEvent) => {
      lenis.scrollTo(e.detail, { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    };
    
    window.addEventListener('lenis-scrollTo' as any, handleCustomScroll);

    return () => {
      window.removeEventListener('lenis-scrollTo' as any, handleCustomScroll);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
