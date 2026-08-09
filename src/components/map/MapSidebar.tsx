import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { MAP_STYLE_IDS, MAP_STYLE_PRESETS } from '../../config/mapGlobe';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import { useAppTheme } from '../../theme';
import { LocationCategory } from '../../types/map';
import { getCategoryConfig } from '../../utils/categoryUtils';

export default function MapSidebar() {
  const map = useMapIntegration();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const { utm_source } = useLocalSearchParams<{ utm_source?: string }>();
  const pulse = useRef(new Animated.Value(1)).current;
  const desktop = width >= theme.breakpoints.desktop;

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
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 40, padding: desktop ? 20 : 12 }}>
      <View style={[theme.shadows.raised, {
        width: '100%', maxWidth: desktop ? 980 : undefined, alignSelf: 'center', borderRadius: theme.radii.xl,
        borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.backgroundElevated,
        padding: desktop ? theme.spacing.md : theme.spacing.sm, gap: theme.spacing.sm,
      }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}>
            <Ionicons name="earth" size={22} color={theme.colors.primary} />
          </View>
          {desktop ? (
            <View style={{ minWidth: 180 }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Sustainability Globe</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 12 }]}>89 verified EV locations · Bulgaria</Text>
            </View>
          ) : null}
          <View style={{ flex: 1, minHeight: 46, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.sm }}>
            <Ionicons name="search" size={19} color={theme.colors.textMuted} />
            <TextInput
              value={map.query}
              onChangeText={map.setQuery}
              placeholder="Search chargers, towns or postcodes"
              placeholderTextColor={theme.colors.textMuted}
              accessibilityLabel="Search sustainability locations"
              returnKeyType="search"
              style={[theme.typography.bodySmall, { flex: 1, color: theme.colors.text, paddingHorizontal: theme.spacing.sm, paddingVertical: Platform.OS === 'web' ? 10 : 8 }]}
            />
            {map.query ? <Pressable accessibilityLabel="Clear search" onPress={() => map.setQuery('')} hitSlop={8}><Ionicons name="close-circle" size={20} color={theme.colors.textMuted} /></Pressable> : null}
          </View>
          {desktop ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={map.isResultsRailCollapsed ? 'Show map results rail' : 'Hide map results rail'}
              onPress={() => map.setResultsRailCollapsed(!map.isResultsRailCollapsed)}
              style={{ minWidth: 48, minHeight: 48, borderRadius: theme.radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: map.isResultsRailCollapsed ? theme.colors.primarySoft : theme.colors.surfaceMuted }}
            >
              <Ionicons name={map.isResultsRailCollapsed ? 'albums-outline' : 'albums'} size={21} color={theme.colors.primary} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button" accessibilityLabel="Show map results"
              onPress={() => map.setResultsOpen(!map.isResultsOpen)}
              style={{ minWidth: 48, minHeight: 48, borderRadius: theme.radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: map.isResultsOpen ? theme.colors.primary : theme.colors.primarySoft }}
            >
              <Ionicons name="list" size={21} color={map.isResultsOpen ? theme.colors.textInverse : theme.colors.primary} />
            </Pressable>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.xs, alignItems: 'center' }}>
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
                  <Text style={[theme.typography.label, { color: active ? theme.colors.textInverse : theme.colors.text }]}>{config.label}</Text>
                </Pressable>
              );
            })}
          </Animated.View>
          <View style={{ width: 1, height: 28, backgroundColor: theme.colors.border, marginHorizontal: 2 }} />
          {MAP_STYLE_IDS.map((styleId) => {
            const preset = MAP_STYLE_PRESETS[styleId];
            const active = map.styleId === styleId;
            return (
              <Pressable
                key={styleId}
                accessibilityRole="button"
                accessibilityLabel={`Map style: ${preset.label}`}
                accessibilityState={{ selected: active }}
                onPress={() => map.setStyleId(styleId)}
                style={{ minHeight: 40, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: active ? theme.colors.accentSoft : theme.colors.surface, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border }}
              >
                <View style={{ flexDirection: 'row' }}>{preset.swatches.map((color, index) => <View key={color} style={{ width: 13, height: 22, marginLeft: index ? -3 : 0, backgroundColor: color, borderRadius: 7, borderWidth: 1, borderColor: theme.colors.backgroundElevated }} />)}</View>
                <Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{preset.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
