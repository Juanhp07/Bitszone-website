import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import SpecularButton from './ui/SpecularButton';
import GlassSurface from './ui/GlassSurface';
import GradientText from './ui/GradientText';
import { SpecularText } from './ui/SpecularText';
import { LiquidMetalText } from './ui/LiquidMetalText';

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
            <GlassSurface
              width="fit-content"
              height="fit-content"
              className="flex items-center justify-center group transition-transform duration-300 hover:scale-105 !shadow-[0_0_30px_rgba(85,16,141,0.2)] hover:!shadow-[0_0_50px_rgba(85,16,141,0.5)] !border-none"
              borderRadius={999}
              borderWidth={0}
              backgroundOpacity={0.15}
              blur={40}
              distortionScale={-30}
              style={{ borderRadius: '999px' }}
            >
              <style>{`
                @keyframes bounce-right {
                  0%, 100% { transform: translateX(0); }
                  50% { transform: translateX(6px); }
                }
                @keyframes text-pulse-soft {
                  0%, 100% { color: #ffffff; filter: drop-shadow(0 0 0px transparent); }
                  50% { color: #d8b4fe; filter: drop-shadow(0 0 6px rgba(216, 180, 254, 0.4)); }
                }
                .animate-text-pulse-soft {
                  animation: text-pulse-soft 2.5s infinite ease-in-out;
                }
                .group:hover .arrow-icon {
                  animation: bounce-right 1s infinite ease-in-out !important;
                  color: #d8b4fe !important;
                  filter: drop-shadow(0 0 8px rgba(216, 180, 254, 0.5)) !important;
                }
              `}</style>
              <SpecularButton
                radius={999}
                tint="transparent"
                tintOpacity={0}
                blur={40}
                lineColor="#FF9FFC"
                baseColor="#000000"
                intensity={4.0}
                thickness={2}
                className="!bg-transparent px-6 py-4 xl:px-8 xl:py-5 2xl:px-10 2xl:py-6"
              >
                <div className="flex items-center justify-center gap-3 font-inter text-sm xl:text-lg 2xl:text-xl font-medium w-full h-full text-white">
                  Explorar catálogo
                  <ArrowRight className="arrow-icon w-5 h-5 xl:w-6 xl:h-6 2xl:w-8 2xl:h-8 animate-text-pulse-soft transition-colors duration-300" />
                </div>
              </SpecularButton>
            </GlassSurface>
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
