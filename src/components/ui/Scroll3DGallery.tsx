import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PlayerShowcase } from './PlayerShowcase';

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

  // TIMELINE: Contenedor de 350vh para que todo sea súper lento y fluido.
  // El margen negativo de -20vh hace que la Sección 3 suba solo un poquito,
  // dando el espacio perfecto para que la animación termine y no bloquee el dock.
  
  // TÍTULO: 
  const titleY = useTransform(scrollYProgress, [0.0, 0.15], [0, -600]);
  // On phones the title starts smaller: at 1.5× "encuentra su ritmo" is wider than the screen.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const on = () => setNarrow(window.innerWidth < 768);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const titleScale = useTransform(scrollYProgress, [0.0, 0.15], narrow ? [1.1, 0.8] : [1.5, 0.8]);
  const titleOpacity = useTransform(scrollYProgress, [0.05, 0.15], [1, 0]);
  
  
  // Para garantizar que la capa 3D no bloquee el "dock" de la Sección 3,
  // apagamos sus interacciones cuando la opacidad empieza a bajar.
  const pointerEvents = useTransform(scrollYProgress, v => v > 0.85 ? "none" : "auto");
  

  return (
    // Z-20 asegura que los álbumes queden POR ENCIMA de la Sección 3 mientras se desvanecen
    <div ref={containerRef} className="relative w-full h-[350vh] -mb-[20vh] z-20">
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-transparent flex flex-col items-center justify-center">
        
        {/* TÍTULO */}
        <div className="absolute top-[30vh] left-0 w-full z-20 flex flex-col items-center pointer-events-none px-[16px]">
          <motion.div 
            style={{ 
              scale: titleScale, 
              y: titleY,
              opacity: titleOpacity,
              WebkitFontSmoothing: "antialiased"
            }}
            className="flex-col items-center origin-center"
          >
            <h2 className="text-[10vw] sm:text-6xl md:text-8xl font-bold text-white text-center tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
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

        {/* ANILLO DE ÁLBUMES + PREVIEW DEL WEB PLAYER */}
        <motion.div
          className="absolute inset-0 z-10"
          style={{ pointerEvents: pointerEvents as any }}
        >
          <PlayerShowcase albums={albums} progress={scrollYProgress} />
        </motion.div>

      </div>
    </div>
  );
};
