import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, useWindowDimensions } from 'react-native';
import { useAppTheme } from '../../theme';
import { useAppLocale } from '../../context/AppLocaleContext';

export default function LocateButton({ onPress, isLoading }: { onPress: () => void; isLoading: boolean }) {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const { width } = useWindowDimensions();
  const desktop = width >= theme.breakpoints.desktop;
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={t('Find my location', 'Намери местоположението ми')} disabled={isLoading} onPress={onPress}
      style={({ pressed }) => [theme.shadows.raised, { position: 'absolute', zIndex: 45, right: desktop ? 22 : 14, bottom: desktop ? 64 : 64, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.backgroundElevated, borderWidth: 1, borderColor: theme.colors.border, opacity: pressed ? 0.82 : 1 }]}
    >
      {isLoading ? <ActivityIndicator color={theme.colors.primary} /> : <Ionicons name="locate" size={23} color={theme.colors.primary} />}
    </Pressable>
  );
}
