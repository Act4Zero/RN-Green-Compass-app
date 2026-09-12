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
  'umbrella-thorn': require('../../../../assets/images/ecosystem/umbrella-thorn-realistic.webp'),
  'african-baobab': require('../../../../assets/images/ecosystem/african-baobab-realistic.webp'),
  marula: require('../../../../assets/images/ecosystem/marula-realistic.webp'),
  'silver-cluster-leaf': require('../../../../assets/images/ecosystem/silver-cluster-leaf-realistic.webp'),
  'red-oat-grass': require('../../../../assets/images/ecosystem/red-oat-grass-realistic.webp'),
  'elephant-grass': require('../../../../assets/images/ecosystem/elephant-grass-realistic.webp'),
  'devils-thorn': require('../../../../assets/images/ecosystem/devils-thorn-realistic.webp'),
  'african-wild-sage': require('../../../../assets/images/ecosystem/african-wild-sage-realistic.webp'),
  'kapok-tree': require('../../../../assets/images/ecosystem/kapok-tree-realistic.webp'),
  'brazil-nut-tree': require('../../../../assets/images/ecosystem/brazil-nut-tree-realistic.webp'),
  'cacao-tree': require('../../../../assets/images/ecosystem/cacao-tree-realistic.webp'),
  'rubber-tree': require('../../../../assets/images/ecosystem/rubber-tree-realistic.webp'),
  'acai-palm': require('../../../../assets/images/ecosystem/acai-palm-realistic.webp'),
  'lobster-claw-heliconia': require('../../../../assets/images/ecosystem/lobster-claw-heliconia-realistic.webp'),
  'vanilla-orchid': require('../../../../assets/images/ecosystem/vanilla-orchid-realistic.webp'),
  'giant-taro': require('../../../../assets/images/ecosystem/giant-taro-realistic.webp'),
};

const ENGLISH_OAK_SEED = require('../../../../assets/images/ecosystem/english-oak-seed-realistic.png');
const ENGLISH_OAK_MATURE = require('../../../../assets/images/ecosystem/english-oak-mature-transparent-v3.webp');
const FOREST_SOIL = require('../../../../assets/images/ecosystem/forest-soil-patch-realistic.png');
const SEED_ASSETS: Record<string, ImageSourcePropType> = {
  'english-oak': ENGLISH_OAK_SEED,
  'umbrella-thorn': require('../../../../assets/images/ecosystem/umbrella-thorn-seed-realistic.webp'),
  'kapok-tree': require('../../../../assets/images/ecosystem/kapok-seed-realistic.webp'),
};

const MATURE_ASSETS: Record<string, ImageSourcePropType> = {
  'english-oak': ENGLISH_OAK_MATURE,
  'small-leaved-lime': require('../../../../assets/images/ecosystem/small-leaved-lime-mature-v2.webp'),
  'cornelian-cherry': require('../../../../assets/images/ecosystem/cornelian-cherry-mature-v2.webp'),
  'dog-rose': require('../../../../assets/images/ecosystem/dog-rose-mature-v2.webp'),
};

const EARLY_GROWTH_ATLAS = require('../../../../assets/images/ecosystem/botanical-early-growth-atlas-v1.png');
const ATLAS_COLUMN: Record<string, number> = { 'english-oak': 0, 'umbrella-thorn': 1, 'kapok-tree': 2 };
const STAGE_MATURITY: Record<EcosystemStage, number> = { seed: 0, sprout: .1, young: .3, leafy: .6, mature: 1 };

export function PlantIllustration({ stage, size = 180, speciesSlug = 'english-oak', maturity = STAGE_MATURITY[stage] }: { stage: EcosystemStage; size?: number; speciesSlug?: string; maturity?: number }) {
  const column = ATLAS_COLUMN[speciesSlug];
  if (stage === 'seed') {
    return (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
        <Image source={FOREST_SOIL} resizeMode="contain" style={{ position: 'absolute', width: size * .55, height: size * .18, left: size * .225, bottom: -size * .04 }} />
        {SEED_ASSETS[speciesSlug] ? <Image source={SEED_ASSETS[speciesSlug]} resizeMode="contain" style={{ position: 'absolute', width: size * .23, height: size * .23, left: size * .385, bottom: 0 }} /> : <View style={{ position: 'absolute', width: size * .045, height: size * .03, borderRadius: 9, left: size * .48, bottom: size * .025, backgroundColor: '#66492B' }} />}
      </View>
    );
  }
  const scale = .2 + .8 * Math.sqrt(Math.max(0, Math.min(1, maturity)));
  const drawSize = size * scale;
  const juvenile = (column != null || MATURE_ASSETS[speciesSlug] != null) && stage !== 'mature';
  const matureOpacity = stage === 'leafy' ? Math.max(0, (maturity - .6) / .4) : stage === 'mature' ? 1 : 0;
  const row = stage === 'sprout' ? 0 : 1;

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
      {juvenile && column != null ? <View style={{ position: 'absolute', width: drawSize, height: drawSize, left: (size - drawSize) / 2, bottom: 0, overflow: 'hidden', opacity: 1 - matureOpacity }}>
        <Image source={EARLY_GROWTH_ATLAS} style={{ position: 'absolute', width: drawSize * 3, height: drawSize * 2, left: -column * drawSize, top: -row * drawSize + drawSize * (row === 0 ? .27 : .04) }} />
      </View> : null}
      {juvenile && column == null ? <Image source={SPECIES_ASSETS[speciesSlug]} resizeMode="contain" style={{ position: 'absolute', width: drawSize, height: drawSize, left: (size - drawSize) / 2, bottom: 0, opacity: 1 - matureOpacity }} /> : null}
      {!juvenile || matureOpacity > 0 ? <Image source={MATURE_ASSETS[speciesSlug] || SPECIES_ASSETS[speciesSlug] || SPECIES_ASSETS['english-oak']} resizeMode="contain" style={{ position: 'absolute', width: drawSize, height: drawSize, left: (size - drawSize) / 2, bottom: MATURE_ASSETS[speciesSlug] && speciesSlug !== 'english-oak' ? -drawSize * .065 : 0, opacity: juvenile ? matureOpacity : 1 }} /> : null}
    </View>
  );
}
