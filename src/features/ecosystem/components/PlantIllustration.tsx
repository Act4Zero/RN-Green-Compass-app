import React from 'react';
import { Image, type ImageSourcePropType, View } from 'react-native';
import type { EcosystemStage } from '../types';

const SPECIES_ASSETS: Record<string, ImageSourcePropType> = {
  'english-oak': require('../../../../assets/images/ecosystem/english-oak-realistic.webp'),
  'small-leaved-lime': require('../../../../assets/images/ecosystem/small-leaved-lime-realistic.webp'),
  'cornelian-cherry': require('../../../../assets/images/ecosystem/cornelian-cherry-realistic.webp'),
  'dog-rose': require('../../../../assets/images/ecosystem/dog-rose-realistic.webp'),
  yarrow: require('../../../../assets/images/ecosystem/yarrow-realistic.webp'),
  'red-clover': require('../../../../assets/images/ecosystem/red-clover-realistic.webp'),
  'corn-poppy': require('../../../../assets/images/ecosystem/corn-poppy-realistic.webp'),
  'oxeye-daisy': require('../../../../assets/images/ecosystem/oxeye-daisy-realistic.webp'),
};

const STAGE_SCALE: Record<EcosystemStage, number> = {
  seed: 0,
  sprout: 0.42,
  young: 0.68,
  leafy: 0.86,
  mature: 1,
};

export function PlantIllustration({ stage, size = 180, speciesSlug = 'english-oak' }: { stage: EcosystemStage; size?: number; speciesSlug?: string }) {
  if (stage === 'seed') {
    return (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
        <View style={{ position: 'absolute', left: '18%', right: '18%', bottom: '7%', height: 20, borderRadius: 50, backgroundColor: 'rgba(70,100,55,0.24)' }} />
        <View style={{ position: 'absolute', left: '40%', bottom: '18%', width: 36, height: 23, borderRadius: 18, backgroundColor: '#825C35', transform: [{ rotate: '-12deg' }], borderWidth: 2, borderColor: '#68472B' }} />
      </View>
    );
  }

  const scale = STAGE_SCALE[stage];
  const imageHeight = size * 1.34;
  const imageWidth = imageHeight * (2 / 3);

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
      <View style={{ position: 'absolute', left: '18%', right: '18%', bottom: '5%', height: 18, borderRadius: 50, backgroundColor: 'rgba(70,100,55,0.22)' }} />
      <Image
        source={SPECIES_ASSETS[speciesSlug] || SPECIES_ASSETS['english-oak']}
        resizeMode="contain"
        style={{
          position: 'absolute',
          width: imageWidth,
          height: imageHeight,
          left: (size - imageWidth) / 2,
          bottom: -imageHeight * (1 - scale) / 2,
          transform: [{ scale }],
        }}
      />
    </View>
  );
}
