import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import { useAppLocale } from '../../context/AppLocaleContext';
import { useAppTheme } from '../../theme';
import { LocationCategory } from '../../types/map';
import { getCategoryConfig } from '../../utils/categoryUtils';
import { searchBulgarianAddress } from '../../services/geocodingService';
import type { GeocodingResult } from '../../services/geocodingService';

export default function MapSidebar({ compact = false, onAddressSearchResult }: { compact?: boolean; onAddressSearchResult?: (result: GeocodingResult) => void }) {
  const map = useMapIntegration();
  const { t } = useAppLocale();
  const { theme } = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { utm_source } = useLocalSearchParams<{ utm_source?: string }>();
  const pulse = useRef(new Animated.Value(1)).current;
  const desktop = width >= theme.breakpoints.desktop;
  const [isAddressSearching, setIsAddressSearching] = useState(false);
  const [addressResult, setAddressResult] = useState<GeocodingResult | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  const submitAddressSearch = async () => {
    const query = map.query.trim();
    setAddressResult(null);
    setAddressError(null);
    if (query.length < 3) {
      setAddressError(t('Enter at least 3 characters.', 'Въведете поне 3 знака.'));
      return;
    }
    setIsAddressSearching(true);
    try {
      const result = await searchBulgarianAddress(query);
      if (!result) {
        setAddressError(t('No address was found in Bulgaria.', 'Не е намерен такъв адрес в България.'));
        return;
      }
      setAddressResult(result);
      onAddressSearchResult?.(result);
    } catch {
      setAddressError(t('Address search is temporarily unavailable.', 'Търсенето на адрес временно не е достъпно.'));
    } finally {
      setIsAddressSearching(false);
    }
  };

  useEffect(() => {
    if (utm_source !== 'landing') return;
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.04, duration: 400, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1.04, duration: 400, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [pulse, utm_source]);

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 40, padding: compact ? 12 : desktop ? 20 : 12 }}>
      <View style={[theme.shadows.raised, {
        width: '100%', maxWidth: compact ? 620 : desktop ? 980 : undefined, alignSelf: 'center', borderRadius: compact ? theme.radii.pill : theme.radii.xl,
        borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.backgroundElevated,
        padding: compact ? theme.spacing.xs : desktop ? theme.spacing.md : theme.spacing.sm, gap: compact ? 0 : theme.spacing.sm,
      }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <View style={{ width: compact ? 38 : 42, height: compact ? 38 : 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}>
            <Ionicons name="earth" size={compact ? 20 : 22} color={theme.colors.primary} />
          </View>
          {desktop && !compact ? (
            <View style={{ minWidth: 180 }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Sustainability Globe', 'Глобус на устойчивостта')}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 12 }]}>{map.locations.length} {t('verified places · Bulgaria', 'проверени места · България')}</Text>
            </View>
          ) : null}
          <View style={{ flex: 1, minHeight: compact ? 42 : 46, borderRadius: compact ? theme.radii.pill : theme.radii.md, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.sm }}>
            <Ionicons name="search" size={19} color={theme.colors.textMuted} />
            <TextInput
              value={map.query}
              onChangeText={(value) => { map.setQuery(value); setAddressResult(null); setAddressError(null); }}
              onSubmitEditing={() => void submitAddressSearch()}
              placeholder={t('Search a place or address', 'Търсете място или адрес')}
              placeholderTextColor={theme.colors.textMuted}
              accessibilityLabel={t('Search places and addresses', 'Търсете места и адреси')}
              returnKeyType="search"
              style={[theme.typography.bodySmall, { flex: 1, color: theme.colors.text, paddingHorizontal: theme.spacing.sm, paddingVertical: Platform.OS === 'web' ? 10 : 8 }]}
            />
            {map.query ? <Pressable accessibilityLabel={t('Clear search', 'Изчистете търсенето')} onPress={() => { map.setQuery(''); setAddressResult(null); setAddressError(null); }} hitSlop={8}><Ionicons name="close-circle" size={20} color={theme.colors.textMuted} /></Pressable> : null}
            <Pressable accessibilityRole="button" accessibilityLabel={t('Find address', 'Намерете адреса')} disabled={isAddressSearching} onPress={() => void submitAddressSearch()} hitSlop={8} style={{ width: 34, height: 34, marginLeft: 6, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }}>
              {isAddressSearching ? <ActivityIndicator size="small" color={theme.colors.textInverse} /> : <Ionicons name="arrow-forward" size={18} color={theme.colors.textInverse} />}
            </Pressable>
          </View>
          {desktop ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={map.isResultsRailCollapsed ? t('Show map results rail', 'Покажете панела с резултати') : t('Hide map results rail', 'Скрийте панела с резултати')}
              onPress={() => map.setResultsRailCollapsed(!map.isResultsRailCollapsed)}
              style={{ minWidth: 48, minHeight: 48, borderRadius: theme.radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: map.isResultsRailCollapsed ? theme.colors.primarySoft : theme.colors.surfaceMuted }}
            >
              <Ionicons name={map.isResultsRailCollapsed ? 'albums-outline' : 'albums'} size={21} color={theme.colors.primary} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button" accessibilityLabel={t('Show map results', 'Покажете резултатите от картата')}
              onPress={() => map.setResultsOpen(!map.isResultsOpen)}
              style={{ minWidth: 48, minHeight: 48, borderRadius: theme.radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: map.isResultsOpen ? theme.colors.primary : theme.colors.primarySoft }}
            >
              <Ionicons name="list" size={21} color={map.isResultsOpen ? theme.colors.textInverse : theme.colors.primary} />
            </Pressable>
          )}
        </View>
        {!compact ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.xs, alignItems: 'center' }}>
          <Animated.View style={{ transform: [{ scale: pulse }], flexDirection: 'row', gap: theme.spacing.xs }}>
            {map.availableCategories.map((category: LocationCategory) => {
              const config = getCategoryConfig(category);
              const active = Boolean(map.filters.categories[category]);
              return (
                <Pressable
                  key={category}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => map.toggleCategory(category, !active)}
                  style={{ minHeight: 40, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: active ? theme.colors.primary : theme.colors.surface, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.borderStrong }}
                >
                  <Ionicons name={config.icon as any} size={17} color={active ? theme.colors.accent : theme.colors.textMuted} />
                  <Text style={[theme.typography.label, { color: active ? theme.colors.textInverse : theme.colors.text }]}>{t(config.label, config.labelBg)}</Text>
                </Pressable>
              );
            })}
          </Animated.View>
          <View style={{ width: 1, height: 28, backgroundColor: theme.colors.border, marginHorizontal: 2 }} />
          <Pressable accessibilityRole="button" accessibilityLabel={t('Open eco-routes', 'Отворете екомаршрутите')} onPress={() => router.push('/map/routes' as any)} style={{ minHeight: 40, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Ionicons name="trail-sign-outline" size={17} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{t('Eco-routes', 'Екомаршрути')}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Manage offline maps', 'Управление на офлайн картите')} onPress={() => router.push('/map/offline' as any)} style={{ minHeight: 40, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Ionicons name="cloud-download-outline" size={17} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{t('Offline maps', 'Офлайн карти')}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Open map impact', 'Отворете моето въздействие')} onPress={() => router.push('/map/impact' as any)} style={{ minHeight: 40, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Ionicons name="analytics-outline" size={17} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{t('My impact', 'Моето въздействие')}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Suggest a sustainable place', 'Предложете устойчиво място')} onPress={() => router.push('/map/contribute' as any)} style={{ minHeight: 40, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Ionicons name="add-circle-outline" size={17} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{t('Suggest', 'Предложете')}</Text></Pressable>
        </ScrollView> : null}
      </View>
      {addressResult || addressError ? <View accessibilityLiveRegion="polite" style={[theme.shadows.raised, { width: '100%', maxWidth: 620, alignSelf: 'center', marginTop: 8, borderRadius: theme.radii.md, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.backgroundElevated, borderWidth: 1, borderColor: addressError ? theme.colors.warning : theme.colors.borderStrong }]}><Ionicons name={addressError ? 'alert-circle-outline' : 'location'} size={19} color={addressError ? theme.colors.warning : theme.colors.primary} /><Text numberOfLines={2} style={[theme.typography.bodySmall, { flex: 1, color: addressError ? theme.colors.text : theme.colors.textMuted }]}>{addressError || addressResult?.label}</Text></View> : null}
    </View>
  );
}
