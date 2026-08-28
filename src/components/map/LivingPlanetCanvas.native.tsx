import { Canvas } from '@react-three/fiber/native';
import React from 'react';
import type { LivingPlanetQuality } from '../../types/map';

export default function LivingPlanetCanvas({ children, quality, active = true }: { children: React.ReactNode; quality: LivingPlanetQuality; active?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.3], fov: 43, near: 0.1, far: 100 }}
      gl={{ antialias: quality === 'high', alpha: true }}
      frameloop={active ? 'always' : 'never'}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </Canvas>
  );
}
