import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Pressable } from 'react-native';
import { getBiomeCatalog } from '../catalog';
import { buildLocalSnapshot, getEcosystemProgress } from '../progression';
import type { EcosystemBiomeId, EcosystemSnapshot } from '../types';
import { EcosystemHero } from '../components/EcosystemHero';
import { PlantIllustration } from '../components/PlantIllustration';

jest.mock('@/features/knowledge', () => ({ useKnowledgeLocale: () => ({ locale: 'bg', t: (_en: string, bg: string) => bg }) }));
jest.mock('@/theme', () => ({ useAppTheme: () => ({ theme: require('@/theme/tokens').createTheme('light') }) }));
jest.mock('@expo/vector-icons', () => {
  const ReactModule = require('react');
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: { name: string }) => ReactModule.createElement(Text, null, name) };
});
jest.mock('../components/PlantIllustration', () => ({ PlantIllustration: () => null }));

function snapshotAt(growthUnits: number, biome: EcosystemBiomeId = 'forest_meadow'): EcosystemSnapshot {
  const catalog = getBiomeCatalog(biome);
  return { ...buildLocalSnapshot([], undefined, biome), ...getEcosystemProgress(growthUnits),
    unlockedSpecies: catalog.species.filter((species) => species.unlockAt <= growthUnits),
    guests: catalog.guests.filter((guest) => guest.unlockAt <= growthUnits),
    nextGuest: catalog.guests.find((guest) => guest.unlockAt > growthUnits) || null };
}

describe('continuous habitat growth', () => {
  it.each(['forest_meadow', 'savanna', 'rainforest'] as const)('keeps the same landscape and all plant layers at completion in %s', (biome) => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<EcosystemHero snapshot={snapshotAt(528, biome)} onOpen={jest.fn()} />); });
    expect(tree.root.findAllByType(PlantIllustration)).toHaveLength(8);
    expect(tree.root.findByProps({ testID: `habitat-background-${biome}` })).toBeTruthy();
    expect(tree.root.findAllByType(PlantIllustration).at(-1)!.props.stage).toBe('seed');
    act(() => tree.update(<EcosystemHero snapshot={snapshotAt(600, biome)} onOpen={jest.fn()} />));
    expect(tree.root.findAllByType(PlantIllustration)).toHaveLength(9);
    expect(tree.root.findByProps({ testID: 'habitat-regeneration-0' })).toBeTruthy();
    expect(tree.root.findAllByType(PlantIllustration).at(-1)!.props.stage).toBe('mature');
    expect(tree.root.findByProps({ testID: `habitat-background-${biome}` })).toBeTruthy();
    act(() => tree.unmount());
  });

  it('does not change plant ages when selecting a favourite', () => {
    let tree!: renderer.ReactTestRenderer;
    const snapshot = snapshotAt(240);
    act(() => { tree = renderer.create(<EcosystemHero snapshot={snapshot} onOpen={jest.fn()} />); });
    const stages = tree.root.findAllByType(PlantIllustration).map((plant) => plant.props.stage);
    act(() => tree.update(<EcosystemHero snapshot={{ ...snapshot, activeSpecies: snapshot.unlockedSpecies[3] }} onOpen={jest.fn()} />));
    expect(tree.root.findAllByType(PlantIllustration).map((plant) => plant.props.stage)).toEqual(stages);
    expect(stages).toEqual(['mature', 'leafy', 'young', 'seed']);
    act(() => tree.unmount());
  });

  it('labels a preview, exposes zero progress and opens the intended destination', () => {
    let tree!: renderer.ReactTestRenderer;
    const open = jest.fn();
    act(() => { tree = renderer.create(<EcosystemHero snapshot={snapshotAt(0)} preview onOpen={open} />); });
    expect(tree.root.findByProps({ children: 'Поглед напред' })).toBeTruthy();
    expect(tree.root.findByProps({ accessibilityRole: 'progressbar' }).props.accessibilityValue.now).toBe(0);
    act(() => tree.root.findByType(Pressable).props.onPress());
    expect(open).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });
});
