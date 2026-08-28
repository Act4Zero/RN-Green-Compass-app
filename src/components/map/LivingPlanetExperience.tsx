import { Ionicons } from '@expo/vector-icons';
import React, { Component, Suspense, useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import type { MapRendererProps } from '../../types/map';
import { useAppLocale } from '../../context/AppLocaleContext';
import { useAppTheme } from '../../theme';
import LivingPlanetCanvas from './LivingPlanetCanvas';
import LivingPlanetFallbackGlobe from './LivingPlanetFallbackGlobe';
import LivingPlanetScene from './LivingPlanetScene';
import MapLibreRenderer from './MapLibreRenderer';

class PlanetErrorBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function PlanetFallback({ reducedMotion, active }: { reducedMotion: boolean; active: boolean }) {
  const { t } = useAppLocale();
  return (
    <View style={{ flex: 1, backgroundColor: '#03151B' }} accessibilityLabel={t('Living Planet view centered on Europe', 'Живата планета, центрирана към Европа')}>
      <LivingPlanetFallbackGlobe reducedMotion={reducedMotion} active={active} />
    </View>
  );
}

export default function LivingPlanetExperience(props: MapRendererProps) {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const { onReady } = props;
  const progress = useRef(new Animated.Value(props.mode === 'map' ? 1 : 0)).current;
  const globeActive = props.mode !== 'map';
  const mapMounted = props.mode !== 'globe';

  useEffect(() => {
    Animated.timing(progress, { toValue: props.mode === 'map' || props.mode === 'to-map' ? 1 : 0, duration: props.reducedMotion ? 140 : 820, useNativeDriver: true }).start();
  }, [progress, props.mode, props.reducedMotion]);

  useEffect(() => { onReady(); }, [onReady]);

  return (
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: '#03151B' }}>
      {mapMounted ? (
        <Animated.View pointerEvents={props.mode === 'map' ? 'auto' : 'none'} style={{ position: 'absolute', inset: 0, opacity: progress, transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }}>
          <MapLibreRenderer {...props} />
        </Animated.View>
      ) : null}
      <Animated.View pointerEvents={props.mode === 'globe' ? 'auto' : 'none'} style={{ position: 'absolute', inset: 0, opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.42] }) }] }}>
          {props.quality === 'fallback' ? <PlanetFallback reducedMotion={props.reducedMotion} active={globeActive} /> : (
            <PlanetErrorBoundary fallback={<PlanetFallback reducedMotion={props.reducedMotion} active={globeActive} />}>
              <LivingPlanetCanvas quality={props.quality} active={globeActive}>
                <Suspense fallback={null}>
                  <LivingPlanetScene locations={props.locations} selectedLocationId={props.selectedLocationId} reducedMotion={props.reducedMotion} quality={props.quality} onLocationPress={props.onLocationPress} onRequestMap={props.onRequestMap} />
                </Suspense>
              </LivingPlanetCanvas>
            </PlanetErrorBoundary>
          )}
          <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: 52, alignItems: 'center' }}>
            <Pressable accessibilityRole="button" accessibilityLabel={t('Explore Bulgaria in detail', 'Разгледайте България подробно')} onPress={() => props.onRequestMap({ lat: 42.72, lng: 25.35 }, 6.35)} style={[theme.shadows.raised, { minHeight: 50, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: 'rgba(11,23,17,0.88)', borderWidth: 1, borderColor: 'rgba(198,241,119,0.42)' }]}>
              <Ionicons name="navigate-circle" size={22} color="#C6F177" />
              <Text style={[theme.typography.label, { color: '#FFFFFF' }]}>{t('Explore Bulgaria in detail', 'Разгледайте България подробно')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      {props.mode === 'map' ? (
        <View pointerEvents="box-none" style={{ position: 'absolute', zIndex: 100, left: 16, right: 16, bottom: 54, alignItems: 'center' }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Back to globe', 'Назад към глобуса')} onPress={() => props.onRequestGlobe()} style={[theme.shadows.raised, { minHeight: 48, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(11,23,17,0.9)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.38)' }]}>
            <Ionicons name="earth-outline" size={20} color="#FFFFFF" />
            <Text style={[theme.typography.label, { color: '#FFFFFF' }]}>{t('Back to globe', 'Назад към глобуса')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
