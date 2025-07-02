import React from 'react';
import { View, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { MapProvider } from '../../src/context/MapContext';
// Using direct relative imports for map components
import MapView from '../../src/components/map/MapView';
import MapSidebar from '../../src/components/map/MapSidebar';
import CoverageAlert from '../../src/components/map/CoverageAlert';
import MapFooter from '../../src/components/map/MapFooter';
// Import external styles
import { mapScreenStyles } from '../../src/styles/map/MapScreenStyles';

export default function MapScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 768;

  return (
    <MapProvider>
      <View style={[
        styles.container,
        { paddingTop: isWeb ? insets.top : 0 }
      ]}>
        <StatusBar style="dark" />
        
        <View style={styles.content}>
          <MapSidebar />
          <View style={styles.mapContainer}>
            <MapView />
            <CoverageAlert />
          </View>
        </View>
        
        <MapFooter />
      </View>
    </MapProvider>
  );
}

// Use the external styles imported from MapScreenStyles
const styles = mapScreenStyles;
