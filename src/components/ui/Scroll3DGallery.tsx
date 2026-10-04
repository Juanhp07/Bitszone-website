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

  // TÍTULO: Sale de 0 a 0.10
  const titleScale = useTransform(scrollYProgress, [0, 0.10], [1.1, 0.9]);
  const titleY = useTransform(scrollYProgress, [0, 0.10], [0, -150]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  
  // MENU (Bolas): Entra de 0.10 a 0.30, se queda hasta 0.80, sale de 0.80 a 0.95
  const menuY = useTransform(scrollYProgress, [0.10, 0.30, 0.80, 0.95], [300, 0, 0, -300]);
  const menuScale = useTransform(scrollYProgress, [0.10, 0.30, 0.80, 0.95], [0.6, 1, 1, 0.6]);
  const menuOpacity = useTransform(scrollYProgress, [0.10, 0.25, 0.85, 0.95], [0, 1, 1, 0]);
  
  // TEXTO DEL MENÚ: Aparece suavemente solo cuando las bolas ya están asentadas (0.25 a 0.35)
  // Desaparece antes de que las bolas se vayan (0.75 a 0.85)
  const menuTextOpacity = useTransform(scrollYProgress, [0.25, 0.35, 0.75, 0.85], [0, 1, 1, 0]);

  // PROGRESS DE ENTRADA INDIVIDUAL: Para que las bolas escalen desde el centro hacia afuera
  const introProgress = useTransform(scrollYProgress, [0.12, 0.30, 0.80, 0.95], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-[160vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-transparent flex flex-col items-center justify-center">
        
        {/* TÍTULO */}
        <div className="absolute top-[15vh] left-0 w-full z-20 flex flex-col items-center pointer-events-none">
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
