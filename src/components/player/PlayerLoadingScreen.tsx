import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const PlayerLoadingScreen: React.FC = () => {
  const [targetY, setTargetY] = useState(-360);

  useEffect(() => {
    const updateTarget = () => {
      setTargetY(-(window.innerHeight / 2 - 40));
    };
    updateTarget();
    window.addEventListener('resize', updateTarget);
    return () => window.removeEventListener('resize', updateTarget);
  }, []);

  return (
    <motion.div
      exit={{
        transition: { staggerChildren: 0 }
      }}
      className="fixed inset-0 z-[100] pointer-events-none select-none"
    >
      {/* Background layer */}
      <motion.div
        exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
        className="fixed inset-0 bg-[#050505] z-[100] pointer-events-auto"
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
      </motion.div>

      {/* Centered logo that glides to header and shrinks to fit */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] pointer-events-none flex items-center justify-center">
        <motion.div
          exit={{
            y: targetY,
            scale: 1,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          }}
          style={{
            scale: 1.55,
          }}
          className="flex items-center justify-center"
        >
          <div className="border-none bg-transparent select-none cursor-default">
            <span
              className="font-inter font-bold text-4xl text-white tracking-tight"
              style={{
                filter: 'drop-shadow(0 0 35px rgba(168, 85, 247, 0.6))',
              }}
            >
              Bitszone
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
