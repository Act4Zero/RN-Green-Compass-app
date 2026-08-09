import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import { useAppTheme } from '../../theme';

export default function CoverageAlert() {
  const map = useMapIntegration();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  if (!map.isOutOfCoverage) return null;
  const desktop = width >= theme.breakpoints.desktop;
  return (
    <View accessibilityLiveRegion="polite" style={[theme.shadows.raised, { position: 'absolute', zIndex: 55, top: desktop ? 150 : 146, alignSelf: 'center', maxWidth: 520, marginHorizontal: 16, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.warning, backgroundColor: theme.colors.backgroundElevated, padding: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }]}>
      <Ionicons name="location-outline" size={21} color={theme.colors.warning} />
      <Text style={[theme.typography.bodySmall, { color: theme.colors.text, flex: 1 }]}>Verified coverage is currently limited to Bulgaria.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Return to Bulgaria" onPress={map.resetViewportToDefault} style={{ minHeight: 40, justifyContent: 'center', paddingHorizontal: theme.spacing.sm, borderRadius: theme.radii.sm, backgroundColor: theme.colors.primarySoft }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>Return</Text></Pressable>
    </View>
  );
}
