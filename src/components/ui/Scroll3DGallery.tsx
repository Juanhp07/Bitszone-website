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
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center pt-32 pb-24">
      {/* TÍTULO */}
      <motion.div 
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center w-full mb-16 lg:mb-24 flex flex-col items-center relative z-20"
      >
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-sora font-extrabold tracking-tighter text-white leading-[1.05]">
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
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="inline-block mt-2"
          >
            encuentra su ritmo
          </motion.span>
        </h2>
      </motion.div>

      {/* INFINITE MENU 3D */}
      <motion.div 
        initial={{ opacity: 0, y: 120, scale: 0.8 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full relative z-10 pointer-events-auto h-[70vh] min-h-[600px]"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent 2%, black 10%, black 90%, transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 2%, black 10%, black 90%, transparent 100%)'
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
        />
      </motion.div>
    </div>
  );
};

