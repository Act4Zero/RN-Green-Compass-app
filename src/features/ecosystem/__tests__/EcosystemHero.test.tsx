import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Image, Modal } from 'react-native';
import { getBiomeCatalog } from '../catalog';
import { buildLocalSnapshot, getEcosystemProgress } from '../progression';
import type { EcosystemBiomeId, EcosystemSnapshot } from '../types';
import { EcosystemHero } from '../components/EcosystemHero';
import { HabitatScene } from '../components/HabitatScene';
import { HabitatViewer } from '../components/HabitatViewer';
import { getHabitatPhase, getHabitatPhaseThresholds } from '../habitatVisuals';

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

describe('coherent habitat landscapes', () => {
  it.each(['forest_meadow', 'savanna', 'rainforest'] as const)('develops one whole landscape through four phases in %s', (biome) => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<HabitatScene snapshot={snapshotAt(0, biome)} />); });
    for (const [units, phase] of [[0, 'early'], [143, 'early'], [144, 'young'], [599, 'young'], [600, 'mature'], [1079, 'mature'], [1080, 'renewal'], [10000, 'renewal']] as const) {
      act(() => tree.update(<HabitatScene snapshot={snapshotAt(units, biome)} />));
      const images = tree.root.findAllByType(Image);
      expect(images).toHaveLength(1);
      expect(images[0].props.testID).toBe(`habitat-landscape-${biome}-${phase}`);
      expect(images[0].props.resizeMode).toBe('contain');
      expect(images[0].props.accessibilityLabel).toBeTruthy();
    }
    act(() => tree.unmount());
  });

  it('keeps landscape growth independent of the favourite species', () => {
    let tree!: renderer.ReactTestRenderer;
    const snapshot = snapshotAt(240);
    act(() => { tree = renderer.create(<HabitatScene snapshot={snapshot} />); });
    const landscape = tree.root.findByType(Image).props.source;
    act(() => tree.update(<HabitatScene snapshot={{ ...snapshot, activeSpecies: snapshot.unlockedSpecies[3] }} />));
    expect(tree.root.findByType(Image).props.source).toEqual(landscape);
    expect(tree.root.findByType(Image).props.testID).toBe('habitat-landscape-forest_meadow-young');
    act(() => tree.unmount());
  });

  it('normalizes invalid growth and keeps preview thresholds aligned with phases', () => {
    for (const biome of ['forest_meadow', 'savanna', 'rainforest'] as const) {
      expect(getHabitatPhase(-1, biome)).toBe('early');
      expect(getHabitatPhase(NaN, biome)).toBe('early');
      expect(getHabitatPhaseThresholds(biome).map(units => getHabitatPhase(units, biome))).toEqual(['early', 'young', 'mature', 'renewal']);
    }
  });

  it('opens and closes the landscape without navigating or changing progress', () => {
    let tree!: renderer.ReactTestRenderer;
    const open = jest.fn();
    const snapshot = snapshotAt(0);
    act(() => { tree = renderer.create(<EcosystemHero snapshot={snapshot} preview onOpen={open} />); });
    expect(tree.root.findByProps({ children: 'Поглед напред' })).toBeTruthy();
    expect(tree.root.findByProps({ accessibilityRole: 'progressbar' }).props.accessibilityValue.now).toBe(0);
    const expand = tree.root.findAll(node => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel?.startsWith('Разгърни пейзажа'))[0];
    act(() => expand.props.onPress());
    expect(tree.root.findByType(HabitatViewer).props.snapshot).toBe(snapshot);
    expect(open).not.toHaveBeenCalled();
    act(() => tree.root.findByProps({ testID: 'habitat-viewer-viewport' }).props.onLayout({ nativeEvent: { layout: { width: 390, height: 600 } } }));
    expect(tree.root.findByProps({ testID: 'habitat-viewer-image' }).props.style.width).toBe(390);
    act(() => tree.root.findByProps({ accessibilityLabel: 'Увеличи пейзажа' }).props.onPress());
    expect(tree.root.findByProps({ testID: 'habitat-viewer-image' }).props.style.width).toBe(780);
    act(() => tree.root.findByProps({ accessibilityLabel: 'Покажи целия пейзаж' }).props.onPress());
    expect(tree.root.findByProps({ testID: 'habitat-viewer-image' }).props.style.width).toBe(390);
    act(() => tree.root.findByProps({ accessibilityLabel: 'Затвори пейзажа' }).props.onPress());
    expect(tree.root.findAllByType(HabitatViewer)).toHaveLength(0);
    act(() => expand.props.onPress());
    act(() => tree.root.findByType(Modal).props.onRequestClose());
    expect(tree.root.findAllByType(HabitatViewer)).toHaveLength(0);
    expect(tree.root.findByProps({ accessibilityRole: 'progressbar' }).props.accessibilityValue.now).toBe(0);
    act(() => tree.root.findByProps({ testID: 'ecosystem-open' }).props.onPress());
    expect(open).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });
});
