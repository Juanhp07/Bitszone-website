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

  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 30,
    mass: 1,
    restDelta: 0.001
  });

  // TÍTULO: Sale de 0 a 0.15
  const titleScale = useTransform(smoothScrollYProgress, [0, 0.15], [1.2, 0.8]);
  const titleY = useTransform(smoothScrollYProgress, [0, 0.15], [0, -300]);
  const titleOpacity = useTransform(smoothScrollYProgress, [0, 0.12], [1, 0]);
  
  // MENU (Bolas): Entra de 0.15 a 0.35, se queda hasta 0.75, sale de 0.75 a 0.90
  const menuY = useTransform(smoothScrollYProgress, [0.15, 0.35, 0.75, 0.90], [300, 0, 0, -300]);
  const menuScale = useTransform(smoothScrollYProgress, [0.15, 0.35, 0.75, 0.90], [0.6, 1, 1, 0.6]);
  const menuOpacity = useTransform(smoothScrollYProgress, [0.15, 0.30, 0.80, 0.90], [0, 1, 1, 0]);
  
  // TEXTO DEL MENÚ: Aparece suavemente solo cuando las bolas ya están asentadas (0.30 a 0.40)
  // Desaparece antes de que las bolas se vayan (0.70 a 0.80)
  const menuTextOpacity = useTransform(smoothScrollYProgress, [0.30, 0.40, 0.70, 0.80], [0, 1, 1, 0]);

  // PROGRESS DE ENTRADA INDIVIDUAL: Para que las bolas escalen desde el centro hacia afuera
  const introProgress = useTransform(smoothScrollYProgress, [0.18, 0.35, 0.75, 0.90], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-[160vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-transparent flex flex-col items-center justify-center">
        
        {/* TÍTULO */}
        <div className="absolute top-[35vh] left-0 w-full z-20 flex flex-col items-center pointer-events-none">
          <motion.div 
            style={{ 
              scale: titleScale, 
              y: titleY,
              opacity: titleOpacity,
              WebkitFontSmoothing: "antialiased"
            }}
            className="flex-col items-center origin-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white text-center tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
              El que busca, <br /> 
              <motion.span 
                animate={{ 
                  textShadow: [
                    "0px 0px 10px rgba(255,159,252,0.4)", 
                    "0px 0px 25px rgba(255,159,252,1)", 
                    "0px 0px 10px rgba(255,159,252,0.4)"
                  ],
                  color: ["#ffffff", "#FF9FFC", "#ffffff"]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block mt-2"
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
            opacity: menuOpacity,
            scale: menuScale,
            y: menuY,
            // Pasamos la opacidad del texto como una variable CSS
            '--menu-text-opacity': menuTextOpacity
          } as any}
        >
          <InfiniteMenu 
            items={albums.map(a => ({
              image: a.src,
              link: '#',
              title: a.title,
              description: a.artist
            }))}
            scale={0.8}
            scrollProgress={introProgress}
          />
        </motion.div>

      </div>
    </div>
  );
};
