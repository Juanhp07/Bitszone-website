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

  // TIMELINE: Contenedor de 350vh para que todo sea súper lento y fluido.
  // El margen negativo de -100vh hace que la Sección 3 suba y se superponga
  // DURANTE el último 100vh de scroll (progreso 0.70 a 1.00).
  // Esto elimina el espacio en blanco y hace que los álbumes se esfumen
  // suavemente mientras la Sección 3 aparece.
  
  // TÍTULO: 
  const titleY = useTransform(scrollYProgress, [0.0, 0.15], [0, -600]);
  const titleScale = useTransform(scrollYProgress, [0.0, 0.15], [1.5, 0.8]);
  const titleOpacity = useTransform(scrollYProgress, [0.05, 0.15], [1, 0]);
  
  // MENU (Bolas): Opacidad general 
  // Se mantienen en opacidad 1 hasta el progreso 0.75, y se desvanecen
  // EXACTAMENTE mientras la Sección 3 está subiendo de fondo (0.75 a 1.00)
  const menuOpacity = useTransform(scrollYProgress, [0.10, 0.20, 0.75, 0.95], [0, 1, 1, 0]);
  
  // Animación puramente atada al scroll
  // Entra muy lento del centro a los bordes (0.10 a 0.45)
  // Se mantiene vivo (0.45 a 0.75) para que los textos salgan completos y los puedas leer
  // Desaparece en reversa y se esfuma (0.75 a 1.00) mientras entra la Sección 3
  const introProgress = useTransform(scrollYProgress, [0.10, 0.45, 0.75, 1.00], [0, 1, 1, 0]);

  return (
    // Z-20 asegura que los álbumes queden POR ENCIMA de la Sección 3 mientras se desvanecen
    <div ref={containerRef} className="relative w-full h-[350vh] -mb-[100vh] z-20">
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
            opacity: menuOpacity
          }}
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
