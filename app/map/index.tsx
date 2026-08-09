import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MapProvider } from '../../src/context/MapContext';
import MapView from '../../src/components/map/MapView';
import { useAppTheme } from '@/theme';

export default function MapScreen() {
  const { theme } = useAppTheme();
  return (
    <MapProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <MapView />
      </View>
    </MapProvider>
  );
}
