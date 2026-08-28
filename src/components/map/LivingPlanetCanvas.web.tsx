import { Canvas } from '@react-three/fiber';
import React from 'react';
import type { LivingPlanetQuality } from '../../types/map';

export default function LivingPlanetCanvas({ children, quality, active = true }: { children: React.ReactNode; quality: LivingPlanetQuality; active?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.15], fov: 43, near: 0.1, far: 100 }}
      dpr={quality === 'high' ? [1, 2] : [1, 1.25]}
      gl={{ antialias: quality === 'high', alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </Canvas>
  );
}
