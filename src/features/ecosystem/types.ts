import type { PointEvent, PointSource } from '@/types/community/points';

export type LocalizedText = { en: string; bg: string };
export type EcosystemStage = 'seed' | 'sprout' | 'young' | 'leafy' | 'mature';

export interface EcosystemSpecies {
  slug: string;
  scientificName: string;
  name: LocalizedText;
  shortDescription: LocalizedText;
  curiosity: LocalizedText;
  habitat: LocalizedText;
  sourceLabel: string;
  sourceUrl: string;
  unlockAt: number;
}

export interface EcosystemGuest {
  slug: string;
  name: LocalizedText;
  message: LocalizedText;
  icon: 'bug-outline' | 'musical-notes-outline' | 'paw-outline' | 'flower-outline';
  unlockAt: number;
}

export interface EcosystemGrowthRule {
  source: PointSource;
  units: number;
  requiresReference: boolean;
  dailyCap?: number;
}

export interface EcosystemProgress {
  growthUnits: number;
  stage: EcosystemStage;
  stageIndex: number;
  currentStageStart: number;
  nextStageAt: number | null;
  unitsToNextStage: number;
  stageProgress: number;
}

export interface EcosystemSnapshot extends EcosystemProgress {
  biome: 'forest_meadow';
  activeSpecies: EcosystemSpecies;
  unlockedSpecies: EcosystemSpecies[];
  guests: EcosystemGuest[];
  nextGuest: EcosystemGuest | null;
  source: 'server' | 'local';
}

export interface EcosystemSnapshotInput {
  userId?: string;
  pointEvents: PointEvent[];
}
