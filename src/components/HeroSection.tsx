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
  
  // Parallax exit effect for the main hero content
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]); // Moves down slightly while scaling up
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.3]); // Flies towards the camera

  return (
    <section className="relative w-full mx-auto min-h-[100svh] flex flex-col justify-center px-[20px] sm:px-8 md:px-16 2xl:px-24 overflow-x-clip">
      
      <motion.div 
        style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
        className="relative z-20 w-full max-w-[1920px] mx-auto flex flex-col items-center justify-center text-center flex-1 pt-24 md:pt-32 2xl:pt-48 -mt-16 md:-mt-24 2xl:-mt-32"
      >

        {/* Huge Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="flex flex-col items-center justify-center text-center w-full font-sans font-bold"
        >
          <span className="text-white text-[10.5vw] sm:text-[8.6vw] md:text-[8vw] lg:text-[80px] xl:text-[100px] 2xl:text-[120px] tracking-tight leading-none z-10">
            Tus músicas sin conexión
          </span>
          <LiquidMetalText
            text="descarga sin límites"
            className="w-fit max-w-full -mt-2 sm:-mt-4 md:-mt-8 h-[13vw] sm:h-[11.5vw] md:h-[11vw] lg:h-[130px] xl:h-[150px] 2xl:h-[180px] text-[8.4vw] sm:text-[7.6vw] md:text-[7.2vw] lg:text-[80px] xl:text-[100px] 2xl:text-[120px]"
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
          <a href="/player" target="_blank" rel="noopener noreferrer" className="block no-underline group cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_35px_rgba(255,159,252,0.8)] hover:brightness-110">
            <GlassSurface
              width="fit-content"
              height="fit-content"
              borderRadius={999}
              backgroundOpacity={0.4}
              blur={4}
              className="relative z-10 transition-colors duration-500 ease-out group-hover:!bg-[rgba(10,0,20,0.3)]"
              style={{ borderRadius: '999px' }}
            >
                              {/* Efecto de borde rotativo (solo en hover) */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[999px] overflow-hidden">
                  <div className="absolute inset-[-200%] w-[400%] h-[400%] [animation:rotate-gradient_4s_linear_infinite]">
                    <div className="absolute inset-0 [background:conic-gradient(from_calc(270deg-(90deg*0.5)),transparent_0,rgba(255,159,252,0.8)_90deg,transparent_90deg)]" />
                  </div>
                  <div className="absolute inset-[1.5px] rounded-[999px] bg-[rgba(10,0,20,0.8)] backdrop-blur-[8px]" />
                </div>

                {/* Contorno interactivo perfectamente alineado DENTRO del cristal */}
                <div className="absolute inset-0 pointer-events-none z-20 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                <SpecularButton
                  radius={999}
                  tint="transparent"
                  tintOpacity={0}
                  blur={0}
                  lineColor="#FF9FFC"
                  baseColor="#000000"
                  intensity={4.0}
                  thickness={2}
                  proximity={0}
                  autoAnimate={true}
                  speed={1.5}
                  className="w-full h-full !m-0 !p-0 border-none !bg-transparent !shadow-none !backdrop-filter-none text-transparent"
                >
                  <span className="hidden"></span>
                </SpecularButton>
              </div>

              {/* Efecto de olas del fondo real pasando a través del cristal oscuro */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[999px] pointer-events-none overflow-hidden mix-blend-screen bg-[rgba(255,159,252,0.05)]" />
              <style>{`
                @keyframes bounce-right {
                  0%, 100% { transform: translateX(0); }
                  50% { transform: translateX(6px); }
                }
                @keyframes text-pulse-soft {
                  0%, 100% { color: #ffffff; filter: drop-shadow(0 0 0px transparent); }
                  50% { color: #FF9FFC; filter: drop-shadow(0 0 8px rgba(255, 159, 252, 0.5)); }
                }
                .animate-text-pulse-soft {
                  animation: text-pulse-soft 2.5s infinite ease-in-out;
                }
                .group:hover .arrow-icon {
                  animation: bounce-right 1s infinite ease-in-out !important;
                  color: #FF9FFC !important;
                  filter: drop-shadow(0 0 12px rgba(255, 159, 252, 0.9)) !important;
                }
              `}</style>
              
              <div className="relative z-10 flex items-center justify-center gap-3 px-6 py-3 xl:px-8 xl:py-4 2xl:px-10 2xl:py-5 font-inter text-sm xl:text-lg 2xl:text-xl font-medium w-full h-full text-white tracking-wide">
                Explorar catálogo
                <ArrowRight className="arrow-icon w-5 h-5 xl:w-6 xl:h-6 2xl:w-8 2xl:h-8 animate-text-pulse-soft transition-colors duration-300" />
              </div>
            </GlassSurface>
          </a>
        </motion.div>
      </motion.div>

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
