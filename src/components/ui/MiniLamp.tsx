import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const MiniLamp = ({ isHovered, isActive }: { isHovered: boolean, isActive: boolean }) => {
  const show = isHovered; // ONLY show on hover, as requested by the user

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute -top-[14px] 2xl:-top-[20px] left-1/2 -translate-x-1/2 w-full h-[60px] min-w-[60px] pointer-events-none z-[-1]"
        >
          {/* 1. Flawless Volumetric Light Cone (No sharp edges) */}
          <motion.div 
            initial={{ opacity: 0, width: "10px", x: "-50%", y: -5 }}
            animate={{ opacity: 1, width: "160%", x: "-50%", y: 0 }}
            exit={{ opacity: 0, width: "10px", x: "-50%", y: -5 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute top-0 left-1/2 h-[60px] mix-blend-screen"
          >
             <div 
                className="w-full h-full"
                style={{ 
                  background: 'linear-gradient(to bottom, rgba(180,151,207,0.4) 0%, rgba(82,39,255,0.1) 50%, transparent 100%)',
                  maskImage: 'radial-gradient(50% 100% at 50% 0%, black 0%, transparent 100%)',
                  WebkitMaskImage: 'radial-gradient(50% 100% at 50% 0%, black 0%, transparent 100%)'
                }}
             />
          </motion.div>

          {/* 2. Massive Ambient Background Glow */}
          <motion.div
            initial={{ opacity: 0, width: "20px", x: "-50%" }}
            animate={{ opacity: 0.6, width: "150%", x: "-50%" }}
            exit={{ opacity: 0, width: "20px", x: "-50%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute top-0 left-1/2 h-[30px] bg-[#5227FF] blur-[16px] rounded-full"
          />

          {/* 3. Intense Core Glow (Lilac) */}
          <motion.div
            initial={{ opacity: 0, width: "10px", x: "-50%" }}
            animate={{ opacity: 1, width: "90%", x: "-50%" }}
            exit={{ opacity: 0, width: "10px", x: "-50%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute top-0 left-1/2 h-[15px] bg-[#B497CF] blur-[8px] rounded-full"
          />

          {/* 4. The Solid Light Line (Lilac from Image 3) */}
          <motion.div
            initial={{ opacity: 0, width: "0px", x: "-50%" }}
            animate={{ opacity: 1, width: "120%", x: "-50%" }}
            exit={{ opacity: 0, width: "0px", x: "-50%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute top-0 left-1/2 h-[1px] 2xl:h-[2px] bg-[#B497CF] shadow-[0_0_12px_2px_rgba(180,151,207,0.8)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
