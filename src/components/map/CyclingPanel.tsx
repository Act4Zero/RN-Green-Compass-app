import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';
import { CYCLING_COLORS, CYCLING_LABELS, CYCLING_PATHS, CYCLING_PLACES, SOFIA_CYCLING, type CyclingFeature, type CyclingKind } from '@/features/cycling';

export default function CyclingPanel({ selected, showPlaces, onTogglePlaces, onClearSelection }: { selected: CyclingFeature | null; showPlaces: boolean; onTogglePlaces: () => void; onClearSelection: () => void }) {
  const { theme } = useAppTheme();
  const { t, locale } = useAppLocale();
  const { width } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);
  const desktop = width >= theme.breakpoints.desktop;
  const placeKinds = (['parking', 'water'] as CyclingKind[]).filter(kind => CYCLING_PLACES.features.some(feature => feature.properties.kind === kind));
  const date = (SOFIA_CYCLING.metadata.dataUpdatedAt || SOFIA_CYCLING.metadata.retrievedAt).slice(0, 10);
  const kinds = (['track', 'lane', 'shared', 'mixed'] as CyclingKind[]).filter(kind => CYCLING_PATHS.features.some(feature => feature.properties.kind === kind));
  return <View style={[theme.shadows.raised, { position: 'absolute', zIndex: 60, right: 12, left: desktop ? undefined : 12, width: desktop ? 310 : undefined, top: desktop ? 164 : 154, padding: 14, gap: 10, backgroundColor: theme.colors.surface, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border }]}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={t('Cycling map legend and details', 'Легенда и подробности за велокартата')} onPress={() => setExpanded(value => !value)} style={{ minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="bicycle" size={23} color={theme.colors.primary} /><Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]}>{t('Sofia by bike', 'С колело из София')}</Text><Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textMuted} /></Pressable>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{kinds.map(kind => <View key={kind} style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}><View style={{ width: 18, height: 4, borderRadius: 2, backgroundColor: CYCLING_COLORS[kind] }} /><Text style={[theme.typography.bodySmall, { fontSize: 11, color: theme.colors.text }]}>{CYCLING_LABELS[kind][locale]}</Text></View>)}</View>
    {showPlaces && placeKinds.length ? <View style={{ flexDirection: 'row', gap: 12 }}>{placeKinds.map(kind => <View key={kind} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: CYCLING_COLORS[kind] }}><Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>{kind === 'parking' ? 'P' : '●'}</Text></View><Text style={[theme.typography.bodySmall, { color: theme.colors.text, fontSize: 11 }]}>{CYCLING_LABELS[kind][locale]}</Text></View>)}</View> : null}
    {selected ? <View style={{ paddingTop: 8, borderTopWidth: 1, borderColor: theme.colors.border, gap: 7 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={[theme.typography.label, { color: theme.colors.text, flex: 1 }]}>{selected.properties.name || CYCLING_LABELS[selected.properties.kind][locale]}</Text><Pressable accessibilityRole="button" accessibilityLabel={t('Close details', 'Затвори подробностите')} onPress={onClearSelection} hitSlop={10}><Ionicons name="close" size={20} color={theme.colors.textMuted} /></Pressable></View>
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{CYCLING_LABELS[selected.properties.kind][locale]}{selected.properties.capacity ? ` · ${selected.properties.capacity} ${t('spaces', 'места')}` : ''}</Text>
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(selected.properties.sourceUrl)} style={{ minHeight: 34, justifyContent: 'center' }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{t('View source', 'Виж източника')} ↗</Text></Pressable>
    </View> : null}
    {expanded ? <>
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Tap a line or place for details. Shared sections may include pedestrians or traffic.', 'Докосни линия или място за подробности. Споделените участъци може да включват пешеходци или автомобили.')}</Text>
      {CYCLING_PLACES.features.length ? <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: showPlaces }} onPress={onTogglePlaces} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 14, backgroundColor: theme.colors.primarySoft }}><Ionicons name={showPlaces ? 'checkbox' : 'square-outline'} size={22} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.text, flex: 1 }]}>{t('Bicycle parking & fountains', 'Велопаркинги и чешми')}</Text></Pressable> : null}
      <Text style={[theme.typography.bodySmall, { fontSize: 11, color: theme.colors.textMuted }]}>{t('Mapped data', 'Картографски данни')}: {date}. {t('Temporary changes may be missing.', 'Временни промени може да липсват.')}</Text>
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(SOFIA_CYCLING.metadata.licenseUrl)}><Text style={[theme.typography.bodySmall, { fontSize: 11, color: theme.colors.primary }]}>© {SOFIA_CYCLING.metadata.source} ↗</Text></Pressable>
    </> : <Text style={[theme.typography.bodySmall, { fontSize: 10, color: theme.colors.textMuted }]}>{t('Data', 'Данни')}: {date} · {SOFIA_CYCLING.metadata.source}</Text>}
  </View>;
}
