import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { getBiomeCatalog } from '../catalog';
import { buildLocalSnapshot, getEcosystemProgress } from '../progression';
import type { EcosystemBiomeId, EcosystemSnapshot } from '../types';
import { EcosystemHero } from '../components/EcosystemHero';

jest.mock('@/features/knowledge', () => ({
  useKnowledgeLocale: () => ({ locale: 'bg', t: (_english: string, bulgarian: string) => bulgarian }),
}));
jest.mock('@/theme', () => ({ useAppTheme: () => ({ theme: require('@/theme/tokens').createTheme('light') }) }));
jest.mock('@expo/vector-icons', () => {
  const ReactModule = require('react');
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: { name: string }) => ReactModule.createElement(Text, null, name) };
});
jest.mock('../components/PlantIllustration', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  return { PlantIllustration: () => ReactModule.createElement(View, { testID: 'plant-illustration' }) };
});

function snapshotAt(growthUnits: number, biome: EcosystemBiomeId = 'forest_meadow'): EcosystemSnapshot {
  const catalog = getBiomeCatalog(biome);
  const base = buildLocalSnapshot([], undefined, biome);
  return {
    ...base,
    ...getEcosystemProgress(growthUnits),
    unlockedSpecies: catalog.species.filter((species) => species.unlockAt <= growthUnits),
    guests: catalog.guests.filter((guest) => guest.unlockAt <= growthUnits),
    nextGuest: catalog.guests.find((guest) => guest.unlockAt > growthUnits) || null,
  };
}

describe('fully unlocked ecosystem hero', () => {
  it('switches to the complete landscape without stacking plant cutouts over it', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<EcosystemHero snapshot={snapshotAt(528)} onOpen={jest.fn()} />); });

    expect(tree.root.findAllByProps({ testID: 'plant-illustration' })).toHaveLength(0);
    expect(tree.root.findByProps({ children: 'Напълно отключена екосистема' })).toBeTruthy();
    act(() => tree.unmount());
  });

  it('keeps progressively unlocked plant layers before completion', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<EcosystemHero snapshot={snapshotAt(456)} onOpen={jest.fn()} />); });

    expect(tree.root.findAllByProps({ testID: 'plant-illustration' }).length).toBeGreaterThan(0);
    expect(tree.root.findAllByProps({ children: 'Напълно отключена екосистема' })).toHaveLength(0);
    act(() => tree.unmount());
  });

  it.each(['forest_meadow', 'savanna', 'rainforest'] as const)('uses a clean fully unlocked landscape for %s', (biome) => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<EcosystemHero snapshot={snapshotAt(528, biome)} onOpen={jest.fn()} />); });
    expect(tree.root.findAllByProps({ testID: 'plant-illustration' })).toHaveLength(0);
    expect(tree.root.findByProps({ children: 'Напълно отключена екосистема' })).toBeTruthy();
    act(() => tree.unmount());
  });
});
