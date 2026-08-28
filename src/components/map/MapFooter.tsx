import React from 'react';
import { Linking, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useAppTheme } from '../../theme';

export default function MapFooter() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= theme.breakpoints.desktop;
  return (
    <View style={{ position: 'absolute', zIndex: 30, left: desktop ? 374 : 12, bottom: 12, borderRadius: theme.radii.pill, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: theme.colors.backgroundElevated, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', gap: 6 }}>
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://openchargemap.org/site/about/terms')}><Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>Data © Open Charge Map</Text></Pressable>
      <Text style={{ color: theme.colors.borderStrong, fontSize: 10 }}>·</Text>
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://www.openstreetmap.org/copyright')}><Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>© OpenStreetMap</Text></Pressable>
      <Text style={{ color: theme.colors.borderStrong, fontSize: 10 }}>·</Text>
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://openfreemap.org/')}><Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>OpenFreeMap / Protomaps</Text></Pressable>
    </View>
  );
}
