import React from 'react';
import { Image, Text, View } from 'react-native';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

export function AuthBrand() {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  return <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, marginBottom: 24, borderRadius: 20, backgroundColor: theme.colors.primarySoft }}>
    <Image source={require('../../../assets/images/GCLogo-rich-premium-original-shape.png')} resizeMode="contain" style={{ width: 52, height: 52 }} accessibilityLabel="Green Compass" />
    <View style={{ flex: 1, gap: 4 }}>
      <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Green Compass</Text>
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 12 }]}>{t('Small steps. A living world. 🌱', 'Малки стъпки. Жив свят. 🌱')}</Text>
    </View>
  </View>;
}
