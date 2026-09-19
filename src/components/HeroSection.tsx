import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import LiquidEther from './ui/LiquidEther';
import SpecularButton from './ui/SpecularButton';
import GlassSurface from './ui/GlassSurface';
import GradientText from './ui/GradientText';

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

      <div className="relative z-20 w-full max-w-[1920px] mx-auto mt-20 md:mt-10">
        
        {/* Huge Typography */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="flex flex-col font-sora font-extrabold mb-10 md:mb-14 xl:mb-16 w-fit"
        >
          <span className="text-white text-[10vw] sm:text-[7vw] lg:text-[75px] xl:text-[85px] 2xl:text-[110px] tracking-tight leading-[1]">TU MÚSICA</span>
          <GradientText
            colors={['#FF9FFC', '#B497CF', '#5227FF']}
            animationSpeed={5}
            className="text-[14vw] sm:text-[10vw] lg:text-[115px] xl:text-[135px] 2xl:text-[170px] italic tracking-tight pr-4 leading-[0.85] !m-0"
          >
            <span style={{ fontFamily: '"DM Serif Display", serif' }}>SIN CONEXIÓN.</span>
          </GradientText>
          <span className="text-white text-[10vw] sm:text-[7vw] lg:text-[75px] xl:text-[85px] 2xl:text-[110px] tracking-tight leading-[0.9]">DESCARGA</span>
          <GradientText
            colors={['#FF9FFC', '#B497CF', '#5227FF']}
            animationSpeed={5}
            className="text-[14vw] sm:text-[10vw] lg:text-[115px] xl:text-[135px] 2xl:text-[170px] italic tracking-tight pr-4 leading-[0.85] !m-0"
          >
            <span style={{ fontFamily: '"DM Serif Display", serif' }}>SIN LÍMITES.</span>
          </GradientText>
        </motion.h1>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <GlassSurface
             width="fit-content"
             height="fit-content"
             className="rounded-[40px] flex items-center justify-center group transition-transform duration-300 hover:scale-105 shadow-[0_0_30px_rgba(85,16,141,0.2)] hover:shadow-[0_0_50px_rgba(85,16,141,0.5)]"
             borderRadius={40}
             borderWidth={0}
             backgroundOpacity={0.05}
             blur={16}
             distortionScale={-30}
          >
            <SpecularButton
              radius={40}
              tint="transparent"
              tintOpacity={0}
              blur={0}
              lineColor="#FF9FFC"
              baseColor="#7012CE"
              intensity={4.0}
              thickness={2}
              className="!bg-transparent px-10 py-4 xl:px-14 xl:py-6 2xl:px-16 2xl:py-7"
            >
               <div className="flex items-center justify-center gap-3 text-white font-inter text-base xl:text-xl 2xl:text-2xl font-medium w-full h-full">
                 Explorar Catálogo 
                 <ArrowRight className="w-5 h-5 xl:w-6 xl:h-6 2xl:w-8 2xl:h-8 text-[#A0A3BD] transition-all duration-300 ease-out group-hover:text-[#c084fc] group-hover:animate-bounce-x group-hover:drop-shadow-[0_0_12px_rgba(192,132,252,0.9)]" />
               </div>
            </SpecularButton>
          </GlassSurface>
        </motion.div>

      </div>
    </section>
  );
};
