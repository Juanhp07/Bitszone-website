import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
// @ts-ignore
import * as THREE from 'three';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

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

function FloatingAlbum({ album, index, total, scrollYProgress }: { album: AlbumData, index: number, total: number, scrollYProgress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const basePosition = useMemo(() => {
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const y = 1 - (index / (total - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = (2 * Math.PI * index) / goldenRatio;
    
    const layerRadius = 14; 
    
    return {
      x: Math.cos(theta) * radiusAtY * layerRadius,
      y: y * layerRadius, 
      z: Math.sin(theta) * radiusAtY * layerRadius
    };
  }, [index, total]);
  
  // Los álbumes empiezan a salir a partir de 0.15 (cuando el título ya va muy arriba)
  // Así nunca se superponen ni al bajar ni al subir.
  const startProgress = 0.15 + (index / total) * 0.15; 
  const endProgress = startProgress + 0.30; 
  
  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return;
    
    groupRef.current.lookAt(camera.position);
    
    const progress = scrollYProgress.get();
    let localP = (progress - startProgress) / (endProgress - startProgress);
    localP = Math.max(0, Math.min(1, localP));
    
    const easeP = 1 - Math.pow(1 - localP, 3);
    
    const time = clock.getElapsedTime();
    
    const tiltX = 0.4; 
    
    // Gira mucho más lento y suave (solo 1 vuelta y cuarto en total)
    const scrollRotation = progress * Math.PI * 2.5; 
    const angleY = (time * 0.1) + scrollRotation; 
    
    let tmpY = basePosition.y * Math.cos(tiltX) - basePosition.z * Math.sin(tiltX);
    let tmpZ = basePosition.y * Math.sin(tiltX) + basePosition.z * Math.cos(tiltX);
    let tmpX = basePosition.x;

    const finalX = tmpX * Math.cos(angleY) - tmpZ * Math.sin(angleY);
    const finalZ = tmpX * Math.sin(angleY) + tmpZ * Math.cos(angleY);
    const finalY = tmpY - 2;
    
    const startY = -25; 
    const startZ = 10;
    const startX = 0; 
    
    const currentZ = startZ - (startZ - finalZ) * easeP;
    const currentX = startX - (startX - finalX) * easeP;
    const currentY = startY - (startY - finalY) * easeP;
    
    groupRef.current.position.set(currentX, currentY, currentZ);
    groupRef.current.visible = true;
  });

  return (
    <group ref={groupRef}>
      <Html
        transform
        distanceFactor={7.5}
        position={[0, 0, 0.1]}
        style={{
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transform: hovered ? "scale(1.15)" : "scale(1)",
        }}
      >
        <div 
          className="w-56 h-72 rounded-xl overflow-hidden shadow-2xl bg-[#1F2121] p-3.5 select-none cursor-grab flex flex-col transition-all duration-300"
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          style={{
            boxShadow: "0 15px 30px rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <img
            src={album.src}
            alt={album.alt}
            className="w-full h-48 object-cover rounded-lg pointer-events-none"
            draggable={false}
          />
          <div className="mt-4 text-center pointer-events-none flex-1 flex flex-col justify-center">
            <h3 className="text-white text-base font-bold truncate leading-tight drop-shadow-md">{album.title}</h3>
            <p className="text-[#B497CF] text-xs font-medium truncate mt-1.5 drop-shadow-md">{album.artist}</p>
          </div>
        </div>
      </Html>
    </group>
  );
}

function CameraController({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const controlsRef = useRef<any>(null);

  useFrame(({ camera }) => {
    if (!controlsRef.current) return;
    
    const progress = scrollYProgress.get();
    
    // Cámara base alejada a 32 (antes 25) para dar más espacio a los álbumes grandes
    let targetZ = 32;
    if (progress > 0.8) {
      // Al final del scroll, se aleja aún más (hasta 50) para poder rotar con el cursor
      targetZ = 32 + ((progress - 0.8) / 0.2) * 18;
    }
    
    if (progress < 0.95) {
      camera.position.lerp(new THREE.Vector3(0, 0, targetZ), 0.05);
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, -2), 0.05); 
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={false}
      enableRotate={true}
      minDistance={10}
      maxDistance={70}
      autoRotate={false}
      rotateSpeed={0.8}
      target={[0, 0, -2]} 
    />
  );
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

        {/* CANVAS 3D */}
        <div 
          className="absolute inset-0 z-10 pointer-events-auto cursor-grab active:cursor-grabbing"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 2%, black 10%, black 90%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 2%, black 10%, black 90%, transparent 100%)'
          }}
        >
          <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
            <ambientLight intensity={0.5} />
            
            {albums.map((album, i) => (
              <FloatingAlbum 
                key={i} 
                album={album} 
                index={i} 
                total={albums.length}
                scrollYProgress={smoothScrollYProgress} 
              />
            ))}
            
            <CameraController scrollYProgress={smoothScrollYProgress} />
          </Canvas>
        </div>

      </div>
    </div>
  );
};
