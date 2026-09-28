'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Sphere, Torus, Cylinder, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// A procedural 3D Vinyl Record
const VinylRecord = (props: any) => {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={group} {...props}>
      {/* Main black vinyl disc */}
      <Cylinder args={[3, 3, 0.1, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {/* Inner label (deep purple) */}
      <Cylinder args={[1, 1, 0.12, 32]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#5227FF" roughness={0.5} />
      </Cylinder>

      {/* Center hole cutout (simulated by a smaller black cylinder, or just leave it) */}
      <Cylinder args={[0.1, 0.1, 0.15, 16]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#000000" />
      </Cylinder>

      {/* Grooves (torus rings) */}
      {[1.2, 1.5, 1.8, 2.1, 2.4, 2.7].map((r, i) => (
        <Torus key={i} args={[r, 0.02, 16, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]}>
          <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
        </Torus>
      ))}
    </group>
  );
};

// Abstract floating music elements
const FloatingElements = ({ scrollProgress }: { scrollProgress: { current: number } }) => {
  const group = useRef<THREE.Group>(null);
  const elements = useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20 - 10,
        (Math.random() - 0.5) * 15 - 5
      ] as [number, number, number],
      scale: Math.random() * 0.5 + 0.2,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
      speed: Math.random() * 0.5 + 0.2
    }));
  }, []);

  useFrame((state, delta) => {
    if (group.current) {
      // Orbit effect based on time
      group.current.rotation.y += delta * 0.1;
      
      // React to global scroll
      const targetY = scrollProgress.current * 20; // Move elements up as we scroll down
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={group}>
      {elements.map((el, i) => (
        <Float key={i} speed={el.speed} rotationIntensity={2} floatIntensity={2}>
          <Torus args={[0.5, 0.1, 16, 32]} position={el.position} scale={el.scale} rotation={el.rotation}>
            <meshStandardMaterial color={i % 2 === 0 ? "#FF9FFC" : "#B497CF"} emissive={i % 2 === 0 ? "#FF9FFC" : "#B497CF"} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
          </Torus>
        </Float>
      ))}
    </group>
  );
};

// Scene Controller to handle Scroll-Driven Camera and Object Animations
const SceneController = () => {
  const { camera, mouse } = useThree();
  const vinylRef = useRef<THREE.Group>(null);
  
  // A ref to hold the smoothed scroll progress (0 to 1)
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.body.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        targetScrollRef.current = window.scrollY / totalScroll;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state, delta) => {
    // Smooth the scroll value
    scrollRef.current = THREE.MathUtils.lerp(scrollRef.current, targetScrollRef.current, 0.05);
    const s = scrollRef.current;

    // 1. CAMERA MOVEMENT SPLINE
    // Section 1 (Hero): s = 0 -> Camera at [0, 0, 10]
    // Section 2 (Features): s = 0.33 -> Camera at [0, -5, 12]
    // Section 3 (Problem): s = 0.66 -> Camera at [0, -10, 8]
    // Section 4 (Footer): s = 1.0 -> Camera at [0, -15, 15]
    
    const camTargetX = Math.sin(s * Math.PI) * 5; 
    const camTargetY = -s * 25;
    const camTargetZ = 10 + Math.sin(s * Math.PI * 2) * 5;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camTargetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.05);

    // Camera lookAt (always looking slightly ahead of its path)
    const lookAtTarget = new THREE.Vector3(0, -s * 30, 0);
    
    // Add mouse parallax to the lookAt
    lookAtTarget.x += mouse.x * 2;
    lookAtTarget.y += mouse.y * 2;
    
    camera.lookAt(lookAtTarget);

    // 2. HERO OBJECT (VINYL) MOVEMENT
    if (vinylRef.current) {
      // Hero section: centered.
      // As we scroll, it moves relative to the camera, tilting and floating
      const vX = Math.sin(s * Math.PI * 2) * 4;
      const vY = -s * 25 + Math.sin(state.clock.elapsedTime) * 0.5; // Follows camera Y roughly, plus floating
      const vZ = Math.cos(s * Math.PI) * 2;

      vinylRef.current.position.x = THREE.MathUtils.lerp(vinylRef.current.position.x, vX, 0.05);
      vinylRef.current.position.y = THREE.MathUtils.lerp(vinylRef.current.position.y, vY, 0.1);
      vinylRef.current.position.z = THREE.MathUtils.lerp(vinylRef.current.position.z, vZ, 0.05);

      // Tilt the vinyl based on scroll
      vinylRef.current.rotation.x = THREE.MathUtils.lerp(vinylRef.current.rotation.x, s * Math.PI * 2 + 0.5, 0.05);
      vinylRef.current.rotation.z = THREE.MathUtils.lerp(vinylRef.current.rotation.z, s * Math.PI, 0.05);
    }
  });

  return (
    <>
      {/* The main hero object */}
      <group ref={vinylRef}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <VinylRecord scale={1.5} />
        </Float>
      </group>

      {/* Floating secondary objects */}
      <FloatingElements scrollProgress={scrollRef} />
    </>
  );
};

export const Global3DScene = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#FF9FFC" />
        <directionalLight position={[-10, -10, -10]} intensity={2} color="#5227FF" />
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#B497CF" />

        <SceneController />

        {/* Global Particles */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={200} scale={20} size={2} speed={0.4} opacity={0.2} color="#B497CF" />
      </Canvas>
    </div>
  );
};

export default Global3DScene;
