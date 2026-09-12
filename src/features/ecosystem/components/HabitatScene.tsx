import React, { useState } from 'react';
import { ImageBackground, type ImageSourcePropType, Text, View } from 'react-native';
import { getHabitatRegeneration, getSpeciesGrowth } from '../progression';
import type { EcosystemBiomeId, EcosystemSnapshot } from '../types';
import { PlantIllustration } from './PlantIllustration';

const BACKGROUNDS: Record<EcosystemBiomeId, ImageSourcePropType> = {
  forest_meadow: require('../../../../assets/images/ecosystem/open-bulgarian-meadow-v3.webp'),
  savanna: require('../../../../assets/images/ecosystem/open-savanna-v1.webp'),
  rainforest: require('../../../../assets/images/ecosystem/open-rainforest-v1.webp'),
};

// Every plant stays rooted in one place. Trees stand behind shrubs and herbs;
// the savanna keeps open space between its crowns even when fully grown.
const POSITIONS = [
  { x: 22, y: 78, height: .74 }, { x: 79, y: 71, height: .56 },
  { x: 43, y: 81, height: .36 }, { x: 69, y: 85, height: .32 },
  { x: 11, y: 95, height: .26 }, { x: 39, y: 97, height: .20 },
  { x: 58, y: 96, height: .24 }, { x: 89, y: 97, height: .25 },
];

export const GUEST_EMOJI: Record<string, string> = {
  bumblebee: '🐝', songbird: '🐦', hedgehog: '🦔', butterfly: '🦋',
  roller: '🐦', giraffe: '🦒', elephant: '🐘', 'savanna-butterfly': '🦋',
  'tree-frog': '🐸', 'blue-morpho': '🦋', toucan: '🐦', sloth: '🦥',
};

export function HabitatScene({ snapshot }: { snapshot: EcosystemSnapshot }) {
  const [sceneWidth, setSceneWidth] = useState(640);
  const height = Math.max(270, Math.min(440, sceneWidth * .54));
  return (
    <View testID="habitat-scene" onLayout={(event) => setSceneWidth(event.nativeEvent.layout.width)} style={{ height, overflow: 'hidden', backgroundColor: '#496849' }}>
      <ImageBackground testID={`habitat-background-${snapshot.biome}`} source={BACKGROUNDS[snapshot.biome]} resizeMode="cover" style={{ width: '100%', height: '100%' }}>
        <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flex: 1 }}>
          {getHabitatRegeneration(snapshot.growthUnits, snapshot.biome).map((plant) => {
            const size = height * (snapshot.biome === 'savanna' ? .23 : .35);
            return <View key={`generation-${plant.index}`} testID={`habitat-regeneration-${plant.index}`} style={{ position: 'absolute', left: `${[48, 59, 9][plant.index]}%`, bottom: `${[31, 35, 30][plant.index]}%`, width: size, height: size, transform: [{ translateX: -size / 2 }] }}>
              <PlantIllustration stage={plant.stage} maturity={plant.maturity} size={size} speciesSlug={plant.species.slug} />
            </View>;
          })}
          {snapshot.unlockedSpecies.map((species, index) => {
            const position = POSITIONS[index];
            if (!position) return null;
            const growth = getSpeciesGrowth(snapshot.growthUnits, species);
            const size = height * position.height * (snapshot.biome === 'savanna' && index < 2 ? .83 : 1);
            return (
              <View key={species.slug} testID={`habitat-plant-${species.slug}`} style={{ position: 'absolute', left: `${position.x}%`, bottom: `${100 - position.y}%`, width: size, height: size, transform: [{ translateX: -size / 2 }] }}>
                <View style={{ position: 'absolute', width: size * (.15 + .55 * growth.maturity), height: size * (.025 + .045 * growth.maturity), borderRadius: 999, backgroundColor: 'rgba(25,40,16,0.18)', bottom: -2, left: size * (.425 - .275 * growth.maturity) }} />
                <PlantIllustration stage={growth.stage} maturity={growth.maturity} size={size} speciesSlug={species.slug} />
              </View>
            );
          })}
        </View>
      </ImageBackground>
      <View style={{ position: 'absolute', top: 14, left: 14, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(15,43,29,.88)' }}>
        <Text style={{ fontFamily: 'Manrope_600SemiBold', color: '#F5F9E9', fontSize: 12 }}>Green Compass · 🌱</Text>
      </View>
    </View>
  );
}
