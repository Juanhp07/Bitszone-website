import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import LiquidEther from './ui/LiquidEther';
import SpecularButton from './ui/SpecularButton';
import GlassSurface from './ui/GlassSurface';
import GradientText from './ui/GradientText';
import { SpecularText } from './ui/SpecularText';
import { LiquidMetalText } from './ui/LiquidMetalText';

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

      {/* Smooth Gradient Transition to Section 2 */}
      <div className="absolute -bottom-1 left-0 right-0 h-[300px] md:h-[500px] z-10 bg-gradient-to-t from-canvas via-canvas/90 to-transparent pointer-events-none"></div>

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
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 md:mt-4 2xl:mt-6"
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

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-white/60 text-[10px] xl:text-xs font-inter uppercase tracking-[0.2em] mb-1">Descubre más</span>
        
        {/* Mouse icon */}
        <div className="w-[24px] h-[38px] xl:w-[28px] xl:h-[44px] rounded-full border-[2px] border-white/20 flex justify-center pt-2 relative overflow-hidden backdrop-blur-md shadow-[0_0_15px_rgba(82,39,255,0.15)]">
          {/* Glowing animated wheel */}
          <motion.div
            animate={{ 
              y: [0, 14],
              opacity: [1, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "circOut" 
            }}
            className="w-1 h-2.5 rounded-full bg-gradient-to-b from-[#FF9FFC] to-[#c084fc] shadow-[0_0_8px_rgba(255,159,252,0.8)]"
          />
        </div>

      </motion.div>
    </section>
  );
};
