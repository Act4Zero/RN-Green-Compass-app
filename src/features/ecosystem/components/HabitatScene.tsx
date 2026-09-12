import React from 'react';
import { Image, View } from 'react-native';
import { useKnowledgeLocale } from '@/features/knowledge';
import { getHabitatPhase, HABITAT_DESCRIPTIONS, HABITAT_IMAGES, HABITAT_PHASE_LABELS } from '../habitatVisuals';
import type { EcosystemSnapshot } from '../types';

export const GUEST_EMOJI: Record<string, string> = {
  bumblebee: '🐝', songbird: '🐦', hedgehog: '🦔', butterfly: '🦋',
  roller: '🐦', giraffe: '🦒', elephant: '🐘', 'savanna-butterfly': '🦋',
  'tree-frog': '🐸', 'blue-morpho': '🦋', toucan: '🐦', sloth: '🦥',
};

export function HabitatScene({ snapshot }: { snapshot: EcosystemSnapshot }) {
  const { locale } = useKnowledgeLocale();
  const phase = getHabitatPhase(snapshot.growthUnits, snapshot.biome);
  return <View testID="habitat-scene" style={{ width: '100%', aspectRatio: 16 / 9, overflow: 'hidden', backgroundColor: '#233A2C' }}>
    <Image testID={`habitat-landscape-${snapshot.biome}-${phase}`} source={HABITAT_IMAGES[snapshot.biome][phase]} resizeMode="contain"
      accessibilityLabel={`${HABITAT_PHASE_LABELS[phase][locale]}. ${HABITAT_DESCRIPTIONS[snapshot.biome][locale]}`}
      style={{ width: '100%', height: '100%' }} />
  </View>;
}
