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
  
  const { scrollYProgress: fullProgress } = useScroll({
    target: containerRef,
    offset: ["start bottom", "end end"]
  });

  // TIMELINE UNIFICADA (h-[200vh]):
  // 0.0 -> 0.5: Entrada del contenedor (el tope del contenedor viaja desde abajo hasta arriba de la pantalla)
  // 0.5 -> 1.0: Contenedor estancado (sticky) y salida.

  // TÍTULO (Ocurre mientras el contenedor entra, antes de estancarse)
  // 0.10 -> 0.25: Aparece y baja
  // 0.25 -> 0.35: Parpadea
  // 0.35 -> 0.50: Se encoje y sube (Desaparece por completo justo cuando se estanca)
  const titleY = useTransform(fullProgress, [0.10, 0.25, 0.35, 0.50], [-100, 0, 0, -400]);
  const titleScale = useTransform(fullProgress, [0.10, 0.25, 0.35, 0.50], [0.8, 1.2, 1.2, 0]);
  const titleOpacity = useTransform(
    fullProgress, 
    [0.10, 0.25, 0.27, 0.29, 0.31, 0.33, 0.35, 0.45, 0.50], 
    [0,    1,    0.3,  1,    0.3,  1,    1,    0,    0]
  );
  
  // MENU (Bolas) (Ocurre después de estancarse, cuando el título ya no está)
  // 0.50 -> 0.65: Aparecen limpios
  // 0.65 -> 0.85: Estado activo interactivo
  // 0.85 -> 1.00: Salida suave
  const menuY = useTransform(fullProgress, [0.50, 0.65, 0.85, 1.00], [100, 0, 0, -300]);
  const menuScale = useTransform(fullProgress, [0.50, 0.65, 0.85, 1.00], [0.8, 1, 1, 0.6]);
  const menuOpacity = useTransform(fullProgress, [0.50, 0.60, 0.90, 1.00], [0, 1, 1, 0]);
  const menuTextOpacity = useTransform(fullProgress, [0.60, 0.65, 0.80, 0.90], [0, 1, 1, 0]);
  const introProgress = useTransform(fullProgress, [0.50, 0.65, 0.85, 1.00], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-[200vh]">
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
