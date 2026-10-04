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

  // TIMELINE: Contenedor de 250vh (150vh de scroll pegajoso = mantequilla suave)
  
  // TÍTULO: 
  // Entra gigante y normal con el scroll de la página. 
  // Apenas el contenedor se pega (0.00), empieza a volar hacia arriba y desaparecer.
  // CERO tiempos muertos para que no se sienta "bugeado" o atascado.
  const titleY = useTransform(scrollYProgress, [0, 0.20], [0, -1000]);
  const titleScale = useTransform(scrollYProgress, [0, 0.20], [1.5, 0.5]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  
  // MENU (Bolas):
  // 0.30 -> 0.50: Aparecen limpios de título, suaves y fluidos.
  // 0.50 -> 0.85: Estado activo
  // 0.85 -> 1.00: Salida hacia arriba para la sección 3
  const menuY = useTransform(scrollYProgress, [0.30, 0.50, 0.85, 1.00], [0, 0, 0, -500]);
  const menuScale = useTransform(scrollYProgress, [0.30, 0.50, 0.85, 1.00], [0.8, 1, 1, 0.5]);
  const menuOpacity = useTransform(scrollYProgress, [0.30, 0.45, 0.90, 1.00], [0, 1, 1, 0]);
  const menuTextOpacity = useTransform(scrollYProgress, [0.45, 0.55, 0.80, 0.90], [0, 1, 1, 0]);
  const introProgress = useTransform(scrollYProgress, [0.30, 0.50, 0.85, 1.00], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-[250vh]">
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
            scale={0.6}
            scrollProgress={introProgress}
          />
        </motion.div>

      </div>
    </div>
  );
};
