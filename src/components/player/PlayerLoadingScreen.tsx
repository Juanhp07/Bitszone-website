import React from 'react';
import { motion } from 'framer-motion';

const BARS = [
  { minH: 14, maxH: 44, duration: 1.25, delay: 0.05 },
  { minH: 22, maxH: 64, duration: 1.1, delay: 0.2 },
  { minH: 30, maxH: 82, duration: 1.4, delay: 0.1 },
  { minH: 38, maxH: 98, duration: 1.2, delay: 0.28 }, // Center peak
  { minH: 30, maxH: 80, duration: 1.45, delay: 0.15 },
  { minH: 22, maxH: 60, duration: 1.15, delay: 0.25 },
  { minH: 14, maxH: 40, duration: 1.3, delay: 0.08 },
];

export const PlayerLoadingScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.03, 
        filter: 'blur(12px)',
        transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Ambient background glows matching Bitszone theme */}
      <div 
        className="absolute w-[650px] h-[650px] rounded-full pointer-events-none -translate-y-6"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(88, 28, 135, 0.08) 45%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none translate-y-24"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(147, 51, 234, 0.06) 50%, transparent 75%)',
          filter: 'blur(90px)',
        }}
      />

      {/* Subtle noise texture */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

      {/* Center content stage */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Bitszone Logo */}
        <div className="flex flex-col items-center mb-9">
          <span
            className="text-5xl sm:text-6xl font-normal text-white italic tracking-tight relative select-none"
            style={{
              fontFamily: '"DM Serif Display", serif',
              textShadow: '0 0 40px rgba(168, 85, 247, 0.5), 0 0 80px rgba(168, 85, 247, 0.25), 0 4px 16px rgba(0, 0, 0, 0.9)'
            }}
          >
            Bitszone
          </span>
          <span className="text-[11px] font-semibold tracking-[0.35em] uppercase text-purple-300/60 mt-1 select-none">
            Web Player
          </span>
        </div>

        {/* Fluid Audio Equalizer Waveform */}
        <div className="px-7 py-5 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-end justify-center gap-2.5 h-32 w-64 mb-7 relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
          
          {BARS.map((bar, index) => (
            <motion.div
              key={index}
              animate={{
                height: [
                  bar.minH, 
                  bar.maxH, 
                  bar.minH * 1.4, 
                  bar.maxH * 0.75, 
                  bar.minH
                ],
              }}
              transition={{
                duration: bar.duration,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: bar.delay,
              }}
              className="w-2.5 rounded-full bg-gradient-to-t from-[#6b21a8] via-[#a855f7] to-[#f472b6]"
              style={{
                boxShadow: '0 0 16px rgba(168, 85, 247, 0.55)',
              }}
            />
          ))}
        </div>

        {/* Status text & sleek progress shimmer */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-ping" />
            <span className="text-xs font-medium tracking-[0.22em] uppercase text-white/60">
              Sincronizando música
            </span>
          </div>
          
          <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden relative border border-white/5">
            <motion.div
              className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-[#a855f7] to-transparent"
              animate={{ x: [-96, 192] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
