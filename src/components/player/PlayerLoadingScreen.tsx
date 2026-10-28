import React from 'react';
import { motion } from 'framer-motion';

export const PlayerLoadingScreen: React.FC = () => {
  return (
    <motion.div
      exit={{
        opacity: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
      }}
      className="fixed inset-0 z-[100] pointer-events-auto select-none bg-[#050505] flex items-center justify-center"
    >
      {/* Ambient background glow */}
      <div 
        className="absolute w-[650px] h-[650px] rounded-full pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, rgba(88, 28, 135, 0.08) 45%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

      {/* Centered logo that remains centered and fades out cleanly */}
      <div className="relative z-[101] flex flex-col items-center justify-center">
        <span
          className="font-inter font-bold text-4xl sm:text-5xl text-white tracking-tight"
          style={{
            filter: 'drop-shadow(0 0 35px rgba(168, 85, 247, 0.6))',
          }}
        >
          Bitszone
        </span>
      </div>
    </motion.div>
  );
};
