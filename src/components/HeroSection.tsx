import React from 'react';
import { Button } from './ui/Button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-12 max-w-[1440px] mx-auto min-h-[90vh] flex flex-col justify-center">
      {/* Background Glow */}
      <div className="hero-glow-ring"></div>
      
      <div className="relative z-10 max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-[80px] font-bold leading-[1.1] mb-6"
        >
          <span className="text-white block">TU MÚSICA</span>
          <span className="text-white block">SIN CONEXIÓN.</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-accent to-brand-primary block text-glow">
            DESCARGA SIN LÍMITES.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-[#A0A3BD] text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-inter"
        >
          La fidelidad no debe perder conexión. Obtén el control de tus colecciones y escúchalas sin depender de tu red.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button variant="secondary" className="gap-2">
            Explorar Catálogo <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="gap-2 text-[#A0A3BD]">
            Modo Offline <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
