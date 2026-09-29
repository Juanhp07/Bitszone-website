import React, { useRef, useState, useMemo } from 'react';
import { useScroll, useTransform, motion, MotionValue } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
// @ts-ignore
import * as THREE from 'three';

export type AlbumData = {
  src: string;
  alt: string;
  title: string;
  artist: string;
  color: string;
};

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
    
    const layerRadius = 12; 
    
    return {
      x: Math.cos(theta) * radiusAtY * layerRadius,
      y: y * layerRadius, 
      z: Math.sin(theta) * radiusAtY * layerRadius
    };
  }, [index, total]);
  
  const startProgress = (index / total) * 0.4; 
  const endProgress = startProgress + 0.4;
  
  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return;
    
    groupRef.current.lookAt(camera.position);
    
    const progress = scrollYProgress.get();
    let localP = (progress - startProgress) / (endProgress - startProgress);
    localP = Math.max(0, Math.min(1, localP));
    
    const easeP = 1 - Math.pow(1 - localP, 3);
    
    const time = clock.getElapsedTime();
    
    const tiltX = 0.4; 
    const angleY = time * 0.25; 
    
    let tmpY = basePosition.y * Math.cos(tiltX) - basePosition.z * Math.sin(tiltX);
    let tmpZ = basePosition.y * Math.sin(tiltX) + basePosition.z * Math.cos(tiltX);
    let tmpX = basePosition.x;

    const finalX = tmpX * Math.cos(angleY) - tmpZ * Math.sin(angleY);
    const finalZ = tmpX * Math.sin(angleY) + tmpZ * Math.cos(angleY);
    const finalY = tmpY;
    
    const startZ = 30; 
    const currentZ = startZ - (startZ - finalZ) * easeP;
    
    const startX = 0; 
    const startY = 0; 
    
    const currentX = startX - (startX - finalX) * easeP;
    const currentY = startY - (startY - finalY) * easeP;
    
    groupRef.current.position.set(currentX, currentY, currentZ);
    groupRef.current.visible = currentZ < 24;
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
          className="w-48 h-64 rounded-xl overflow-hidden shadow-2xl bg-[#1F2121] p-3 select-none cursor-grab flex flex-col transition-all duration-300"
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
            className="w-full h-40 object-cover rounded-md pointer-events-none"
            draggable={false}
          />
          <div className="mt-3 text-center pointer-events-none flex-1 flex flex-col justify-center">
            <h3 className="text-white text-sm font-bold truncate leading-tight drop-shadow-md">{album.title}</h3>
            <p className="text-[#B497CF] text-xs font-medium truncate mt-1 drop-shadow-md">{album.artist}</p>
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
    
    if (scrollYProgress.get() < 0.95) {
      camera.position.lerp(new THREE.Vector3(0, 0, 25), 0.02);
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.02); 
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
      maxDistance={40}
      autoRotate={false}
      rotateSpeed={0.8}
      target={[0, 0, 0]} 
    />
  );
}

export const Scroll3DGallery: React.FC<Scroll3DGalleryProps> = ({ albums }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // El título empieza grande (1.8x) y se achica a su tamaño normal (1x) al hacer scroll.
  const titleScale = useTransform(scrollYProgress, [0, 0.3], [1.8, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0.3, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-[500vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col">
        
        {/* ZONA SUPERIOR: Le damos un min-h-[30vh] para que cuando el texto esté en 1.8x de tamaño, 
            no se desborde ni choque con el Canvas 3D (esto previene los problemas de capas y parpadeos) */}
        <div className="w-full pt-8 md:pt-12 pb-0 flex-shrink-0 relative z-20 flex flex-col items-center justify-center min-h-[30vh]">
          <motion.div 
            style={{ 
              scale: titleScale, 
              opacity: titleOpacity,
              // Propiedades para evitar el jitter/parpadeo de sub-píxeles al escalar texto en navegadores
              WebkitFontSmoothing: "antialiased",
              backfaceVisibility: "hidden",
              willChange: "transform, opacity"
            }}
            className="flex flex-col items-center pointer-events-none origin-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white text-center tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
              El que busca, <br /> encuentra su ritmo
            </h2>
          </motion.div>
        </div>

        {/* ZONA INFERIOR: Como la zona superior es más pequeña, el canvas sube naturalmente sin forzar márgenes negativos */}
        <div 
          className="w-full flex-1 relative z-10 pointer-events-auto cursor-grab active:cursor-grabbing"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 2%, black 15%, black 85%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 2%, black 15%, black 85%, transparent 100%)'
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
                scrollYProgress={scrollYProgress} 
              />
            ))}
            
            <CameraController scrollYProgress={scrollYProgress} />
          </Canvas>
        </div>

      </div>
    </div>
  );
};
