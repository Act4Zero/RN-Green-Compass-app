import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Text, View } from 'react-native';
import { getMapboxAccessToken } from '../../config/mapGlobe';
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

function UnavailableState({ message }: { message: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, backgroundColor: theme.colors.background }}>
      <View style={{ maxWidth: 520, alignItems: 'center', gap: theme.spacing.sm }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}>
          <Ionicons name="earth-outline" size={31} color={theme.colors.primary} />
        </View>
        <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, textAlign: 'center' }]}>The globe is taking a breather</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted, textAlign: 'center' }]}>{message}</Text>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, textAlign: 'center' }]}>The location directory remains safely bundled with the app. Check the Mapbox configuration or connection, then reload.</Text>
      </View>
    </View>
  );
}

export default function MapView() {
  const map = useMapIntegration();
  const { theme } = useAppTheme();
  const [mapReady, setMapReady] = useState(false);
  const [rendererError, setRendererError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const hasTrackedView = useRef(false);
  const accessToken = getMapboxAccessToken();

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

  if (map.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>Preparing 89 verified places…</Text>
      </View>
    );
  }
  if (map.error) return <UnavailableState message={map.error.message} />;
  if (!accessToken) return <UnavailableState message="Add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to enable the live 3D map." />;
  if (rendererError) return <UnavailableState message={rendererError} />;

  return (
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: theme.colors.background }}>
      <GlobeRenderer
        accessToken={accessToken}
        locations={map.filteredLocations}
        selectedLocationId={map.selectedLocation?.id ?? null}
        styleId={map.styleId}
        cameraCommand={map.cameraCommand}
        userLocation={map.userLocation}
        reducedMotion={reducedMotion}
        onReady={() => setMapReady(true)}
        onCameraChanged={map.updateCamera}
        onLocationPress={(locationId) => {
          const location = map.filteredLocations.find((candidate) => candidate.id === locationId);
          if (location) map.selectLocation(location, false);
        }}
        onClusterPress={(center, expansionZoom) => {
          analyticsService.trackEvent('map_cluster_opened', { zoom: Math.round(expansionZoom) });
          map.moveCamera({ center, zoom: expansionZoom, pitch: 36 }, 850);
        }}
        onError={setRendererError}
      />
      {!mapReady ? (
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.overlay }}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[theme.typography.label, { color: '#FFFFFF', marginTop: theme.spacing.sm }]}>Bringing the planet into view…</Text>
        </View>
      ) : null}
      <MapSidebar />
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
