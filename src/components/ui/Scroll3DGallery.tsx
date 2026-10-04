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

  // Aumentamos la altura a 300vh para que haya mucho espacio de scroll y la animación sea súper fluida (smooth)
  // TÍTULO: Se queda quieto y visible hasta el 10% del scroll, luego sube y se desvanece suavemente
  const titleScale = useTransform(scrollYProgress, [0, 0.10, 0.25], [1.2, 1.4, 0.8]);
  const titleY = useTransform(scrollYProgress, [0, 0.10, 0.25], [0, -50, -400]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.10, 0.25], [1, 1, 0]);
  
  // MENU (Bolas): Empiezan a aparecer en el 15% (cuando el título ya está subiendo y desvaneciéndose)
  // Llegan a su tamaño final en el 40% (scroll muy suave)
  const menuY = useTransform(scrollYProgress, [0.15, 0.40, 0.70, 0.90], [200, 0, 0, -300]);
  const menuScale = useTransform(scrollYProgress, [0.15, 0.40, 0.70, 0.90], [0.8, 1, 1, 0.8]);
  const menuOpacity = useTransform(scrollYProgress, [0.15, 0.35, 0.75, 0.90], [0, 1, 1, 0]);
  
  // TEXTO DEL MENÚ: Aparece solo cuando las bolas ya terminaron de entrar
  const menuTextOpacity = useTransform(scrollYProgress, [0.35, 0.45, 0.65, 0.75], [0, 1, 1, 0]);

  // PROGRESS DE ENTRADA INDIVIDUAL: Para que las bolas escalen suavemente
  const introProgress = useTransform(scrollYProgress, [0.15, 0.40, 0.70, 0.90], [0, 1, 1, 0]);

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
