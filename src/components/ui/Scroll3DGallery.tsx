import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent, animate } from 'framer-motion';
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

  // TIMELINE: Contenedor de 300vh para dar mucho más recorrido de scroll
  
  // TÍTULO: 
  const titleY = useTransform(scrollYProgress, [0.0, 0.15], [0, -600]);
  const titleScale = useTransform(scrollYProgress, [0.0, 0.15], [1.5, 0.8]);
  const titleOpacity = useTransform(scrollYProgress, [0.05, 0.15], [1, 0]);
  
  // MENU (Bolas): Opacidad general para la entrada y salida
  // Le damos un rango enorme (0.15 a 0.90) para que el usuario pueda scrollear bastante rato
  const menuOpacity = useTransform(scrollYProgress, [0.12, 0.20, 0.90, 0.95], [0, 1, 1, 0]);
  const menuTextOpacity = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.90], [0, 1, 1, 0]);
  
  // Animación Automática del tiempo de entrada (Mucho más lenta y fluida)
  const introProgress = useMotionValue(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Si estamos en la zona de los álbumes, los mostramos
    if (latest >= 0.12 && latest <= 0.88) {
      animate(introProgress, 1, { duration: 1.4, ease: [0.16, 1, 0.3, 1] }); // Curva muy suave (Apple-like)
    } else {
      animate(introProgress, 0, { duration: 1.0, ease: [0.16, 1, 0.3, 1] }); // Salida relajada
    }
  });

  return (
    <div ref={containerRef} className="relative w-full h-[300vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-transparent flex flex-col items-center justify-center">
        
        {/* TÍTULO */}
        <div className="absolute top-[30vh] left-0 w-full z-20 flex flex-col items-center pointer-events-none">
          <motion.div 
            style={{ 
              scale: titleScale, 
              y: titleY,
              opacity: titleOpacity,
              WebkitFontSmoothing: "antialiased"
            }}
            className="flex-col items-center origin-center"
          >
            <h2 className="text-6xl md:text-8xl font-bold text-white text-center tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
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
            scale={1.2}
            scrollProgress={introProgress}
          />
        </motion.div>

      </div>
    </div>
  );
};
