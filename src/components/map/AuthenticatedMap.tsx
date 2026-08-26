import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MapProvider } from '@/context/MapContext';
import { useAppTheme } from '@/theme';
import MapView from './MapView';

export default function AuthenticatedMap() {
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
