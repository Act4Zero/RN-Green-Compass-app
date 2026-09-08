import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { OPENFREEMAP_STYLE_URL } from '../../config/mapGlobe';
import analyticsService from '../../services/analyticsService';
import { useAppTheme } from '../../theme';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import GlobeRenderer from './GlobeRenderer';
import CoverageAlert from './CoverageAlert';
import LocateButton from './LocateButton';
import MapFooter from './MapFooter';
import MapPopup from './MapPopup';
import MapResultsPanel from './MapResultsPanel';
import MapSidebar from './MapSidebar';
import { mapExperienceReducer } from '../../utils/livingPlanet';
import { getOfflineSource } from '../../features/offline-maps';
import type { MapSourceConfig } from '../../types/map';
import { useAppLocale } from '../../context/AppLocaleContext';
import type { GeocodingResult } from '../../services/geocodingService';

function UnavailableState({ message, onBack }: { message: string; onBack?: () => void }) {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, backgroundColor: theme.colors.background }}>
      <View style={{ maxWidth: 520, alignItems: 'center', gap: theme.spacing.sm }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}>
          <Ionicons name="earth-outline" size={31} color={theme.colors.primary} />
        </View>
        <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, textAlign: 'center' }]}>{t('The map is temporarily unavailable', 'Картата временно не е достъпна')}</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted, textAlign: 'center' }]}>{message}</Text>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, textAlign: 'center' }]}>{t('Check your connection or use a downloaded offline map.', 'Проверете връзката си или използвайте изтеглена офлайн карта.')}</Text>
        {onBack ? <Pressable accessibilityRole="button" onPress={onBack} style={{ minHeight: 46, borderRadius: theme.radii.md, paddingHorizontal: theme.spacing.lg, justifyContent: 'center', backgroundColor: theme.colors.primary }}><Text style={[theme.typography.label, { color: theme.colors.textInverse }]}>{t('Back to the globe', 'Назад към глобуса')}</Text></Pressable> : null}
      </View>
    </View>
  );
}

export default function MapView() {
  const map = useMapIntegration();
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const [mapReady, setMapReady] = useState(false);
  const [rendererError, setRendererError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mode, dispatchMode] = useReducer(mapExperienceReducer, 'map');
  const [offline, setOffline] = useState(false);
  const [offlineMapStyle, setOfflineMapStyle] = useState<Record<string, unknown> | null>(null);
  const [searchedAddress, setSearchedAddress] = useState<GeocodingResult | null>(null);
  const { place } = useLocalSearchParams<{ place?: string }>();
  const hasTrackedView = useRef(false);
  const cameraCenterRef = useRef(map.camera.center);
  const moveCamera = map.moveCamera;
  const { width } = useWindowDimensions();
  const source = useMemo<MapSourceConfig>(() => ({
    onlineStyleUrl: OPENFREEMAP_STYLE_URL,
    attribution: offlineMapStyle ? '© OpenStreetMap contributors · Protomaps' : '© OpenStreetMap contributors · OpenFreeMap',
    offlineStyle: offlineMapStyle,
  }), [offlineMapStyle]);

  useEffect(() => NetInfo.addEventListener((state) => {
    const isOffline = state.isConnected === false || state.isInternetReachable === false;
    setOffline(isOffline);
    if (!isOffline) setOfflineMapStyle(null);
    else void getOfflineSource(cameraCenterRef.current).then((result) => setOfflineMapStyle(result?.style || null));
  }), []);

  useEffect(() => {
    if (!map.isDataInitialized || hasTrackedView.current) return;
    hasTrackedView.current = true;
    analyticsService.trackScreenView('Sustainability Globe');
    analyticsService.trackEvent('map_viewed', { location_count: map.locations.length });
  }, [map.isDataInitialized, map.locations.length]);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!map.locationError) return;
    const timeout = setTimeout(map.clearLocationError, 4000);
    return () => clearTimeout(timeout);
  }, [map.clearLocationError, map.locationError]);

  useEffect(() => {
    if (mode !== 'to-map' && mode !== 'to-globe') return;
    const timeout = setTimeout(() => dispatchMode({ type: 'transition-complete' }), reducedMotion ? 150 : 840);
    return () => clearTimeout(timeout);
  }, [mode, reducedMotion]);

  const openMap = useCallback((center?: { lat: number; lng: number }, zoom = 6.35) => {
    if (center) moveCamera({ center, zoom, pitch: zoom > 10 ? 42 : 34 }, reducedMotion ? 0 : 820);
    map.setResultsRailCollapsed(false);
    dispatchMode({ type: 'open-map' });
    setRendererError(null);
  }, [map, moveCamera, reducedMotion]);

  const openGlobe = useCallback(() => {
    map.setResultsRailCollapsed(true);
    dispatchMode({ type: 'open-globe' });
    setRendererError(null);
  }, [map]);

  useEffect(() => {
    if (!place || !map.isDataInitialized) return;
    const selected = map.locations.find((location) => location.id === place);
    if (selected) {
      map.selectLocation(selected, false);
      openMap(selected, 13);
    }
  // The URL handoff is consumed after the public catalogue loads.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map.isDataInitialized, place]);

  if (map.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{t('Preparing the verified sustainability catalogue…', 'Подготвяме каталога с проверени устойчиви места…')}</Text>
      </View>
    );
  }
  if (map.error) return <UnavailableState message={t('The sustainability catalogue could not be loaded.', 'Каталогът с устойчиви места не можа да бъде зареден.')} />;
  if (rendererError && (mode === 'map' || mode === 'to-map')) return <UnavailableState message={t('The map view could not be opened.', 'Картата не можа да бъде отворена.')} onBack={openGlobe} />;

  return (
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: theme.colors.background }}>
      <GlobeRenderer
        locations={map.filteredLocations}
        selectedLocationId={map.selectedLocation?.id ?? null}
        styleId={map.styleId}
        cameraCommand={map.cameraCommand}
        userLocation={map.userLocation}
        searchPoint={searchedAddress}
        reducedMotion={reducedMotion}
        mode={mode}
        quality={width >= 768 && !reducedMotion ? 'high' : 'adaptive'}
        source={source}
        onReady={() => setMapReady(true)}
        onCameraChanged={(camera) => {
          cameraCenterRef.current = camera.center;
          map.updateCamera(camera);
          if (offline) void getOfflineSource(camera.center).then((result) => setOfflineMapStyle(result?.style || null));
        }}
        onLocationPress={(locationId) => {
          const location = map.filteredLocations.find((candidate) => candidate.id === locationId);
          if (location) map.selectLocation(location, false);
        }}
        onClusterPress={(center, expansionZoom) => {
          analyticsService.trackEvent('map_cluster_opened', { zoom: Math.round(expansionZoom) });
          map.moveCamera({ center, zoom: expansionZoom, pitch: 36 }, 850);
        }}
        onRequestMap={openMap}
        onRequestGlobe={openGlobe}
        onError={setRendererError}
      />
      {!mapReady ? (
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.overlay }}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[theme.typography.label, { color: '#FFFFFF', marginTop: theme.spacing.sm }]}>{t('Loading the map…', 'Зареждаме картата…')}</Text>
        </View>
      ) : null}
      <MapSidebar compact={mode === 'globe' || mode === 'to-globe'} onAddressSearchResult={(result) => { setSearchedAddress(result); map.setResultsOpen(false); map.setResultsRailCollapsed(true); dispatchMode({ type: 'open-map' }); setRendererError(null); }} />
      <MapResultsPanel />
      <LocateButton onPress={map.locateUser} isLoading={map.isLocating} />
      <CoverageAlert />
      {map.selectedLocation ? <MapPopup location={map.selectedLocation} /> : null}
      <MapFooter />
      {map.locationError ? (
        <View accessibilityLiveRegion="assertive" style={{ position: 'absolute', left: 16, right: 16, bottom: 92, alignItems: 'center', zIndex: 90 }}>
          <View style={[theme.shadows.raised, { maxWidth: 520, borderRadius: theme.radii.md, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, backgroundColor: theme.colors.danger }]}>
            <Text style={[theme.typography.bodySmall, { color: '#FFFFFF', textAlign: 'center' }]}>{map.locationError}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
