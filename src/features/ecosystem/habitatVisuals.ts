import type { ImageSourcePropType } from 'react-native';
import { getEcosystemMaturity, normalizeGrowth } from './progression';
import type { EcosystemBiomeId, LocalizedText } from './types';

export const HABITAT_PHASES = ['early', 'young', 'mature', 'renewal'] as const;
export type HabitatPhase = typeof HABITAT_PHASES[number];
export const HABITAT_PHASE_LABELS: Record<HabitatPhase, LocalizedText> = {
  early: { en: 'New growth takes root', bg: 'Новият живот пуска корени' },
  young: { en: 'The understory grows', bg: 'Младата растителност се развива' },
  mature: { en: 'A thriving community', bg: 'Развито местообитание' },
  renewal: { en: 'Generations grow together', bg: 'Поколенията растат заедно' },
};
export const HABITAT_DESCRIPTIONS: Record<EcosystemBiomeId, LocalizedText> = {
  forest_meadow: { en: 'An oak woodland edge, sunlit meadow and new growth in the shelter of old trees.', bg: 'Дъбова гора, слънчева поляна и млад растеж под закрилата на старите дървета.' },
  rainforest: { en: 'From the canopy to the stream: palms, ferns and young trees share a living forest floor.', bg: 'От короните до потока: палми, папрати и млади дървета споделят живата горска почва.' },
  savanna: { en: 'Grasses, scattered trees and young shrubs in an open, sunlit landscape.', bg: 'Треви, разпръснати дървета и млади храсти в открит, огрян от слънцето пейзаж.' },
};
export const HABITAT_IMAGES: Record<EcosystemBiomeId, Record<HabitatPhase, ImageSourcePropType>> = {
  forest_meadow: {
    early: require('../../../assets/images/ecosystem/habitats-v2/forest_meadow-early.webp'),
    young: require('../../../assets/images/ecosystem/habitats-v2/forest_meadow-young.webp'),
    mature: require('../../../assets/images/ecosystem/habitats-v2/forest_meadow-mature.webp'),
    renewal: require('../../../assets/images/ecosystem/habitats-v2/forest_meadow-renewal.webp'),
  },
  rainforest: {
    early: require('../../../assets/images/ecosystem/habitats-v2/rainforest-early.webp'),
    young: require('../../../assets/images/ecosystem/habitats-v2/rainforest-young.webp'),
    mature: require('../../../assets/images/ecosystem/habitats-v2/rainforest-mature.webp'),
    renewal: require('../../../assets/images/ecosystem/habitats-v2/rainforest-renewal.webp'),
  },
  savanna: {
    early: require('../../../assets/images/ecosystem/habitats-v2/savanna-early.webp'),
    young: require('../../../assets/images/ecosystem/habitats-v2/savanna-young.webp'),
    mature: require('../../../assets/images/ecosystem/habitats-v2/savanna-mature.webp'),
    renewal: require('../../../assets/images/ecosystem/habitats-v2/savanna-renewal.webp'),
  },
};

// The parent trees belong to the surrounding habitat. Landscape regeneration
// leaves the user's species discoveries, points and individual plant ages intact.
export function getHabitatPhaseThresholds(biome: EcosystemBiomeId) {
  const maturity = getEcosystemMaturity(biome);
  return [0, 144, maturity, maturity + 480];
}
export function getHabitatPhase(units: number, biome: EcosystemBiomeId): HabitatPhase {
  const growth = normalizeGrowth(units);
  let phase: HabitatPhase = 'early';
  getHabitatPhaseThresholds(biome).forEach((threshold, index) => { if (growth >= threshold) phase = HABITAT_PHASES[index]; });
  return phase;
}
