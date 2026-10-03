import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import InfiniteMenu from './InfiniteMenu';

export interface AlbumData {
  src: string;
  alt: string;
  title: string;
  artist: string;
  color: string;
}

interface Scroll3DGalleryProps {
  albums: AlbumData[];
}



export const Scroll3DGallery: React.FC<Scroll3DGalleryProps> = ({ albums }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Resorte matemático para TODO (título y álbumes).
  // Stiffness 40 y Damping 30 da una sensación muy fluida (smooth)
  // pero lo suficientemente rápida para que no te deje esperando al subir.
  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 30,
    mass: 1,
    restDelta: 0.001
  });

  // Aumentamos el rango del título (0 a 0.25) para que no se vaya tan rápido al scrollear
  const titleScale = useTransform(smoothScrollYProgress, [0, 0.25], [1.8, 1]);
  const titleY = useTransform(smoothScrollYProgress, [0, 0.25], [0, -400]);
  const titleOpacity = useTransform(smoothScrollYProgress, [0, 0.25], [1, 0]);
  
  // Se oculta después del 0.25 para matar fantasmas, pero reaparece a tiempo al subir
  const titleVisibility = useTransform(smoothScrollYProgress, (v) => v > 0.26 ? "hidden" : "visible");

  return (
    // Altura balanceada (250vh): Ni tan corta que el título desaparezca en un instante, 
    // ni tan larga que aburra scrollear.
    <div ref={containerRef} className="relative w-full h-[250vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-transparent">
        
        {/* TÍTULO */}
        <div className="absolute top-[35vh] left-0 w-full z-20 flex flex-col items-center pointer-events-none">
          <motion.div 
            style={{ 
              scale: titleScale, 
              y: titleY,
              opacity: titleOpacity,
              visibility: titleVisibility as any,
              WebkitFontSmoothing: "antialiased",
              backfaceVisibility: "hidden"
            }}
            className="flex-col items-center origin-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white text-center tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
              El que busca, <br /> 
              {/* Brillo exacto con el color neón rosa #FF9FFC del botón del slogan */}
              <motion.span 
                animate={{ 
                  textShadow: [
                    "0px 0px 10px rgba(255,159,252,0.4)", 
                    "0px 0px 25px rgba(255,159,252,1)", 
                    "0px 0px 10px rgba(255,159,252,0.4)"
                  ],
                  color: ["#ffffff", "#FF9FFC", "#ffffff"]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="inline-block"
              >
                encuentra su ritmo
              </motion.span>
            </h2>
          </motion.div>
        </div>

        {/* CANVAS 3D / INFINITE MENU */}
        <motion.div 
          className="absolute inset-0 z-10 pointer-events-auto"
          style={{
            opacity: useTransform(smoothScrollYProgress, [0.15, 0.3], [0, 1]),
            scale: useTransform(smoothScrollYProgress, [0.15, 0.3], [0.6, 1]),
            y: useTransform(smoothScrollYProgress, [0.15, 0.3], [150, 0]),
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 2%, black 10%, black 90%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 2%, black 10%, black 90%, transparent 100%)'
          }}
        >
          <InfiniteMenu 
            items={albums.map(a => ({
              image: a.src,
              link: '#',
              title: a.title,
              description: a.artist
            }))}
            scale={1.0}
          />
        </motion.div>

      </div>
    </div>
  );
};
