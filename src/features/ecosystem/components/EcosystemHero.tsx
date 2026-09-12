import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useKnowledgeLocale } from '@/features/knowledge';
import { useAppTheme } from '@/theme';
import { getBiomeCatalog, STAGE_LABELS } from '../catalog';
import { getEcosystemCompletion, getEcosystemMaturity, getNextEcosystemMilestone, getSpeciesGrowth } from '../progression';
import type { EcosystemSnapshot } from '../types';
import { GUEST_EMOJI, HabitatScene } from './HabitatScene';

export function EcosystemHero({ snapshot, loading, preview = false, onOpen, actionLabel }: { snapshot: EcosystemSnapshot; loading?: boolean; preview?: boolean; onOpen: () => void; actionLabel?: string }) {
  const { theme } = useAppTheme();
  const { locale, t } = useKnowledgeLocale();
  const biome = getBiomeCatalog(snapshot.biome);
  const completion = getEcosystemCompletion(snapshot.growthUnits, snapshot.biome);
  const next = getNextEcosystemMilestone(snapshot.growthUnits, snapshot.biome);
  const activeGrowth = getSpeciesGrowth(snapshot.growthUnits, snapshot.activeSpecies);
  const mature = snapshot.growthUnits >= getEcosystemMaturity(snapshot.biome);
  const status = preview ? t('A glimpse ahead', 'Поглед напред') : mature ? t('A flourishing habitat', 'Живо местообитание') : completion.complete ? t('All species discovered', 'Всички видове са открити') : t('Growing with you', 'Расте заедно с теб');
  const nextLabel = next ? next.kind === 'growth'
    ? `${next.name[locale]} · ${STAGE_LABELS[next.stage!][locale]}`
    : `${next.kind === 'guest' ? '🐾' : '🌱'} ${next.name[locale]}` : null;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${status}. ${biome.name[locale]}. ${actionLabel || t('Explore ecosystem', 'Разгледай екосистемата')}`}
      onPress={onOpen} style={({ pressed }) => ({ marginBottom: 20, borderRadius: theme.radii.xl, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden', opacity: pressed ? .94 : 1, ...theme.shadows.subtle })}>
      <HabitatScene snapshot={snapshot} />
      <View style={{ padding: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.label, { color: theme.colors.primary }]}>{status}</Text>
            <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginTop: 3 }]}>{biome.name[locale]}</Text>
          </View>
          {loading ? <ActivityIndicator accessibilityLabel={t('Refreshing growth', 'Обновяване на растежа')} color={theme.colors.primary} /> : <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-forward" size={22} color={theme.colors.textInverse} /></View>}
        </View>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{snapshot.activeSpecies.name[locale]} · {STAGE_LABELS[activeGrowth.stage][locale]}</Text>
        <View style={{ gap: 7 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <Text style={[theme.typography.label, { color: theme.colors.text }]}>{snapshot.unlockedSpecies.length}/{biome.species.length} {t('plants', 'растения')} · {snapshot.guests.length}/{biome.guests.length} {t('guests', 'гости')}</Text>
            <Text style={[theme.typography.label, { color: theme.colors.primary }]}>{snapshot.growthUnits} {t('growth', 'растеж')}</Text>
          </View>
          <View accessible accessibilityRole="progressbar" accessibilityLabel={t('Species discovery', 'Откриване на видове')} accessibilityValue={{ min: 0, max: 100, now: Math.round(completion.progress * 100) }} style={{ height: 7, borderRadius: 999, backgroundColor: theme.colors.surfaceMuted, overflow: 'hidden' }}>
            <View style={{ width: `${completion.progress * 100}%`, height: '100%', borderRadius: 999, backgroundColor: theme.colors.primary }} />
          </View>
        </View>
        <View style={{ padding: 12, borderRadius: 14, backgroundColor: theme.colors.accentSoft, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name={next ? 'sparkles-outline' : 'leaf-outline'} size={20} color={theme.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.label, { color: theme.colors.text }]}>{next ? nextLabel : t('Life keeps growing', 'Животът продължава')}</Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 12 }]}>{next ? t(`${next.at - snapshot.growthUnits} growth to the next change`, `Още ${next.at - snapshot.growthUnits} растеж до следващата промяна`) : t('Keep your habits. Your habitat stays with you.', 'Продължавай с навиците си. Твоят зелен свят остава с теб.')}</Text>
          </View>
        </View>
        {snapshot.guests.length > 0 ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
          {snapshot.guests.map((guest) => <View key={guest.slug} style={{ flexDirection: 'row', gap: 5, backgroundColor: theme.colors.surfaceMuted, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999 }}><Text style={{ fontSize: 14 }}>{GUEST_EMOJI[guest.slug]}</Text><Text style={[theme.typography.label, { color: theme.colors.text, fontSize: 11 }]}>{guest.name[locale]}</Text></View>)}
        </View> : null}
        <Text style={[theme.typography.label, { color: theme.colors.primary }]}>{actionLabel || t('Explore your world', 'Разгледай своя свят')} →</Text>
      </View>
    </Pressable>
  );
}
