import React from 'react';
import { Image, View } from 'react-native';
import { useAppLocale } from '../../context/AppLocaleContext';

export default function LivingPlanetFallbackGlobe({ active = true }: { reducedMotion?: boolean; active?: boolean }) {
  const { t } = useAppLocale();
  return (
    <View pointerEvents="none" style={{ position: 'absolute', inset: 0, opacity: active ? 1 : 0 }}>
      <Image
        accessibilityLabel={t('Living Planet centered on Europe', 'Живата планета, центрирана към Европа')}
        source={require('../../../assets/images/living-planet-fallback.png')}
        resizeMode="contain"
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}
