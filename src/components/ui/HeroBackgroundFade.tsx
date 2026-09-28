'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import LiquidEther from './LiquidEther';

export const HeroBackgroundFade = () => {
  const { scrollY } = useScroll();
  // Fades out completely after 800px of scrolling
  const bgOpacity = useTransform(scrollY, [0, 800], [1, 0]);

  return (
    <motion.div 
      style={{ opacity: bgOpacity }} 
      className="fixed inset-0 z-[-1] pointer-events-none bg-[#05050A]"
    >
      <LiquidEther
        colors={['#5227FF', '#FF9FFC', '#B497CF']}
        mouseForce={30}
        cursorSize={150}
        isViscous={false}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo={true}
        autoSpeed={0.8}
        autoIntensity={3.0}
        takeoverDuration={0.25}
        autoResumeDelay={2000}
        autoRampDuration={0.6}
        backgroundColor="transparent"
        lightMode={false}
      />
    </motion.div>
  );
};

export default HeroBackgroundFade;
