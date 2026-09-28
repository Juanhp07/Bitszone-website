import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { LiquidMetalText } from './ui/LiquidMetalText';
import ShinyButton from './ui/ShinyButton';

export const HeroSection = () => {
  const { scrollY } = useScroll();
  const fadeOutOpacity = useTransform(scrollY, [0, 150], [1, 0]);

  return (
    <section className="relative w-full mx-auto min-h-[100vh] flex flex-col justify-center px-8 md:px-16 2xl:px-24">
      
      <div className="relative z-20 w-full max-w-[1920px] mx-auto flex flex-col items-center justify-center text-center flex-1 pt-24 md:pt-32 2xl:pt-48 -mt-16 md:-mt-24 2xl:-mt-32">

        {/* Huge Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="flex flex-col items-center justify-center text-center w-full font-sans font-bold"
        >
          <span className="text-white text-[11vw] sm:text-[9vw] lg:text-[80px] xl:text-[100px] 2xl:text-[120px] tracking-tight leading-none z-10">
            Tus músicas sin conexión
          </span>
          <LiquidMetalText
            text="descarga sin límites"
            className="w-fit -mt-4 md:-mt-8 h-[16vw] sm:h-[14vw] lg:h-[130px] xl:h-[150px] 2xl:h-[180px] text-[11vw] sm:text-[9vw] lg:text-[80px] xl:text-[100px] 2xl:text-[120px]"
            strokeWidth={3}
          />
        </motion.h1>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 md:mt-8 2xl:mt-10"
        >
          <a href="/player" target="_blank" rel="noopener noreferrer" className="block no-underline">
            <ShinyButton className="px-6 py-4 xl:px-8 xl:py-5 2xl:px-10 2xl:py-6">
              Explorar catálogo <ArrowRight className="arrow-icon w-5 h-5 ml-1" />
            </ShinyButton>
          </a>
        </motion.div>
      </div>

      {/* Interactive Floating Text - Fades out on scroll */}
      <motion.div 
        style={{ opacity: fadeOutOpacity }}
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end z-40 cursor-pointer pointer-events-auto pb-6"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <motion.span 
          animate={{ 
            opacity: [0, 1, 0],
            y: [15, -5, -25]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-[#d8b4fe] text-[10px] md:text-xs xl:text-sm font-inter uppercase tracking-[0.4em] font-medium drop-shadow-[0_0_10px_rgba(112,18,206,0.8)] relative z-10"
        >
          Descubre más
        </motion.span>
      </motion.div>
    </section>
  );
};
