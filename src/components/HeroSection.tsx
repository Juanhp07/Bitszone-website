import React from 'react';
import { motion } from 'framer-motion';
import LiquidEther from './ui/LiquidEther';

export const HeroSection = () => {
  return (
    <section className="relative w-full mx-auto min-h-[100vh] flex flex-col justify-center overflow-hidden px-8 md:px-16 2xl:px-24">
      {/* Liquid Ether Animated Background */}
      <div className="absolute inset-0 z-0">
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
            backgroundColor="#05050A"
            lightMode={false}
        />
      </div>

      <div className="relative z-20 w-full max-w-[1920px] mx-auto flex flex-col items-center text-center">
        
        {/* Minimalist Typography */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="font-inter font-semibold text-[32px] sm:text-[40px] md:text-[56px] lg:text-[72px] tracking-tight leading-[1.1] max-w-4xl"
        >
          <span className="text-white">Tu música sin conexión,</span><br/>
          <span className="text-[#A0A3BD]">descarga sin límites</span>
        </motion.h1>

      </div>
    </section>
  );
};
