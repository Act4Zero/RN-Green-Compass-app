import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import { useAppLocale } from '../../context/AppLocaleContext';
import { useAppTheme } from '../../theme';
import { MapLocation } from '../../types/map';
import { formatLocalizedAddress, getLocalizedLocationName } from '../../utils/mapUtils';
import { getCategoryConfig } from '../../utils/categoryUtils';

function ResultRow({ location }: { location: MapLocation }) {
  const map = useMapIntegration();
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();
  const selected = map.selectedLocation?.id === location.id;
  const category = getCategoryConfig(location.category);
  const recommended = map.recommendationIds.includes(location.id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(`Open ${location.name}`, `Отворете ${getLocalizedLocationName(location, 'bg')}`)}
      onPress={() => map.selectLocation(location)}
      style={({ pressed }) => ({
        padding: theme.spacing.sm, borderRadius: theme.radii.md, gap: 4,
        backgroundColor: selected ? theme.colors.primarySoft : pressed ? theme.colors.surfaceMuted : theme.colors.surface,
        borderWidth: 1, borderColor: selected ? theme.colors.primary : theme.colors.border,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.xs }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }}>
          <Ionicons name={category.icon as any} size={17} color={theme.colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Text numberOfLines={1} style={[theme.typography.label, { color: theme.colors.text, flexShrink: 1 }]}>{getLocalizedLocationName(location, locale)}</Text>{recommended ? <Text style={[theme.typography.label, { color: theme.colors.primary, fontSize: 10 }]}>{t('FOR YOU', 'ЗА ВАС')}</Text> : null}</View>
          <Text numberOfLines={2} style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 12 }]}>{formatLocalizedAddress(location, locale) || location.town}</Text>
        </View>
        {location.power_kw ? <Text style={[theme.typography.label, { color: theme.colors.primary }]}>{location.power_kw} kW</Text> : location.verified ? <Ionicons name="shield-checkmark" size={18} color={theme.colors.primary} /> : null}
      </View>
    </Pressable>
  );
}

export default function MapResultsPanel() {
  const map = useMapIntegration();
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const { width } = useWindowDimensions();
  const desktop = width >= theme.breakpoints.desktop;
  if (desktop && map.isResultsRailCollapsed) return null;
  if (!desktop && !map.isResultsOpen) return null;
  return (
    <View style={[theme.shadows.raised, {
      position: 'absolute', zIndex: 35,
      left: desktop ? 20 : 12, top: desktop ? 146 : 144,
      bottom: desktop ? 54 : 14, width: desktop ? 340 : undefined, right: desktop ? undefined : 12,
      maxHeight: desktop ? undefined : 300,
      borderRadius: theme.radii.xl, borderWidth: 1, borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated, overflow: 'hidden',
    }]}>
      <View style={{ padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text accessibilityLiveRegion="polite" style={[theme.typography.h3, { color: theme.colors.text }]}>{map.visibleLocations.length} {t('places', 'места')}</Text>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 12 }]}>{map.query ? t('Matching your search', 'Съвпадения с търсенето') : t('In the visible area', 'Във видимата област')}</Text>
        </View>
        {!desktop ? <Pressable accessibilityLabel={t('Close results', 'Затворете резултатите')} onPress={() => map.setResultsOpen(false)} hitSlop={8}><Ionicons name="close" size={24} color={theme.colors.textMuted} /></Pressable> : null}
      </View>
      <FlatList
        data={map.visibleLocations}
        keyExtractor={(item, index) => `${item.id}:${item.connection_type ?? 'connector'}:${index}`}
        contentContainerStyle={{ padding: theme.spacing.sm, gap: theme.spacing.xs }}
        renderItem={({ item }) => <ResultRow location={item} />}
        ListEmptyComponent={<View style={{ padding: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.sm }}><Ionicons name="search-outline" size={26} color={theme.colors.textMuted} /><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, textAlign: 'center' }]}>{t('No verified places match this view. Clear the search or return to Bulgaria.', 'Няма проверени места в този изглед. Изчистете търсенето или се върнете към България.')}</Text></View>}
      />
    </View>
  );
}
