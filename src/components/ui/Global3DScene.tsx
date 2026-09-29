'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
// @ts-ignore
import * as THREE from 'three';

// Scene Controller to handle Scroll-Driven Camera
const SceneController = () => {
  const { camera, mouse } = useThree();
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
    scrollRef.current = THREE.MathUtils.lerp(scrollRef.current, targetScrollRef.current, 0.05);
    const s = scrollRef.current;

    // CAMERA MOVEMENT SPLINE
    // Travels downwards through the space
    const camTargetX = Math.sin(s * Math.PI) * 3; 
    const camTargetY = -s * 30; // Move down 30 units across the whole scroll
    const camTargetZ = 10 + Math.sin(s * Math.PI * 2) * 2;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camTargetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.05);

    const lookAtTarget = new THREE.Vector3(0, -s * 35, 0);
    lookAtTarget.x += mouse.x * 3;
    lookAtTarget.y += mouse.y * 3;
    
    camera.lookAt(lookAtTarget);
  });

  return null;
};

export const Global3DScene = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#FF9FFC" />
        <directionalLight position={[-10, -10, -10]} intensity={2} color="#5227FF" />
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#B497CF" />

        <SceneController />

        {/* Global Deep Space Particles */}
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />
        <Sparkles count={150} scale={25} size={3} speed={0.5} opacity={0.3} color="#FF9FFC" />
      </Canvas>
    </div>
  );
};

export default Global3DScene;
