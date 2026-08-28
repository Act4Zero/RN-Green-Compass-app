import type React from 'react';
import type { LivingPlanetQuality } from '../../types/map';

declare const LivingPlanetCanvas: React.ComponentType<{ children: React.ReactNode; quality: LivingPlanetQuality; active?: boolean }>;
export default LivingPlanetCanvas;
