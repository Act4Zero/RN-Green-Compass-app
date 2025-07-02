import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapProvider } from '../../src/context/MapContext';
import MapView from '../../src/components/map/MapView';
import MapSidebar from '../../src/components/map/MapSidebar';
import CoverageAlert from '../../src/components/map/CoverageAlert';
import MapFooter from '../../src/components/map/MapFooter';

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

interface Styles {
  container: React.CSSProperties | any;
  content: React.CSSProperties | any;
  mapContainer: React.CSSProperties | any;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
});
