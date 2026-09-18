import React from 'react';
import { motion } from 'framer-motion';

export const FeatureSection = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto text-center relative z-10">
        <p className="font-jetbrains text-xs tracking-widest text-[#A0A3BD] uppercase mb-4">Descubre Tu Sonido</p>
        <h2 className="text-3xl md:text-5xl font-sora font-bold text-white mb-16">
          EL QUE BUSCA, ENCUENTRA <span className="text-brand-accent">SU LUGAR</span>
        </h2>
        
        {/* Placeholder for the app interface carousel/mockups */}
        <div className="flex justify-center items-center gap-4 md:gap-8 overflow-hidden py-10 opacity-80">
          {[...Array(5)].map((_, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className={`w-40 md:w-64 h-64 md:h-96 rounded-xl border border-white/10 bg-surface-2 flex-shrink-0 relative overflow-hidden ${
                i === 2 ? 'scale-110 z-10 shadow-[0_0_40px_rgba(85,16,141,0.3)]' : 'scale-90 opacity-60 blur-[1px]'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-1/90" />
              <div className="absolute bottom-4 left-4 right-4 h-4 bg-white/5 rounded" />
              <div className="absolute bottom-10 left-4 right-12 h-4 bg-white/5 rounded" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
