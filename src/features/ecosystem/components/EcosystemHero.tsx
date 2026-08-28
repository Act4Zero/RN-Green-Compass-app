import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ImageBackground, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useKnowledgeLocale } from '@/features/knowledge';
import { useAppTheme } from '@/theme';
import { STAGE_LABELS } from '../catalog';
import type { EcosystemSnapshot } from '../types';
import { PlantIllustration } from './PlantIllustration';

const BACKGROUND = require('../../../../assets/images/ecosystem/bulgarian-forest-meadow-v2.png');

const PLANT_POSITIONS = [
  { left: '38%' as const, bottom: 4, size: 210 },
  { left: '62%' as const, bottom: 2, size: 138 },
  { left: '17%' as const, bottom: -2, size: 120 },
  { left: '73%' as const, bottom: -8, size: 94 },
  { left: '48%' as const, bottom: -14, size: 82 },
  { left: '28%' as const, bottom: -15, size: 78 },
];

export function EcosystemHero({ snapshot, loading, onOpen }: { snapshot: EcosystemSnapshot; loading?: boolean; onOpen: () => void }) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const { locale, t } = useKnowledgeLocale();
  const compact = width < 720;
  const stageLabel = STAGE_LABELS[snapshot.stage][locale];
  const plantName = snapshot.activeSpecies.name[locale];
  const growthLabel = snapshot.nextStageAt == null
    ? t('Your plant has reached its mature stage.', 'Растението достигна зрелия си етап.')
    : t(`${snapshot.unitsToNextStage} growth units to the next stage`, `Още ${snapshot.unitsToNextStage} единици растеж до следващия етап`);
  const visibleSpecies = snapshot.unlockedSpecies.slice(0, compact ? 4 : 6);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(`Open your living ecosystem. ${plantName}, ${stageLabel}. ${growthLabel}.`, `Отвори живата си екосистема. ${plantName}, ${stageLabel}. ${growthLabel}.`)}
      onPress={onOpen}
      style={({ pressed }) => ({ marginBottom: 20, opacity: pressed ? 0.96 : 1 })}
    >
      <ImageBackground
        source={BACKGROUND}
        resizeMode="cover"
        imageStyle={{ borderRadius: theme.radii.xl }}
        style={{ minHeight: compact ? 520 : 470, borderRadius: theme.radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: '#8FA68A', ...theme.shadows.raised }}
      >
        <View style={{ flex: 1, padding: compact ? 16 : 26, backgroundColor: 'rgba(9,35,22,0.08)' }}>
          <View style={{ maxWidth: compact ? '100%' : 405, alignSelf: 'flex-start', padding: compact ? 16 : 20, borderRadius: 22, backgroundColor: 'rgba(250,248,238,0.94)', borderWidth: 1, borderColor: 'rgba(23,76,53,0.18)', ...theme.shadows.subtle }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#174C35', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="leaf" size={17} color="#B8E36B" />
              </View>
              <Text style={[theme.typography.label, { color: '#174C35', textTransform: 'uppercase', letterSpacing: 1 }]}>{t('Your living ecosystem', 'Твоята жива екосистема')}</Text>
            </View>
            <Text style={[theme.typography.h1, { color: '#14251C', fontSize: compact ? 27 : 32, marginTop: 12 }]}>{plantName}</Text>
            <Text style={[theme.typography.bodySmall, { color: '#506057', marginTop: 3, fontStyle: 'italic' }]}>{snapshot.activeSpecies.scientificName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#DCEDE2' }}><Text style={[theme.typography.label, { color: '#174C35' }]}>{stageLabel}</Text></View>
              <Text style={[theme.typography.bodySmall, { color: '#506057' }]}>{snapshot.growthUnits} {t('growth', 'растеж')}</Text>
            </View>
            <View accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(snapshot.stageProgress * 100) }} style={{ height: 9, borderRadius: 999, backgroundColor: '#D8DECB', overflow: 'hidden', marginTop: 14 }}>
              <View style={{ width: `${Math.max(4, snapshot.stageProgress * 100)}%`, height: '100%', borderRadius: 999, backgroundColor: '#4C8A50' }} />
            </View>
            <Text style={[theme.typography.bodySmall, { color: '#506057', marginTop: 8 }]}>{growthLabel}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 13 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: '#174C35' }}><Ionicons name="leaf-outline" size={14} color="#B8E36B" /><Text style={[theme.typography.label, { color: '#FFFFFF', fontSize: 10 }]}>{snapshot.unlockedSpecies.length} {t('species', 'вида')}</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: '#E9F1DF' }}><Ionicons name="paw-outline" size={14} color="#174C35" /><Text style={[theme.typography.label, { color: '#174C35', fontSize: 10 }]}>{snapshot.guests.length} {t('wild guests', 'диви гости')}</Text></View>
            </View>
          </View>

          {loading ? <View style={{ position: 'absolute', left: '50%', bottom: 72 }}><ActivityIndicator color="#FFFFFF" /></View> : visibleSpecies.map((species, index) => {
            const position = PLANT_POSITIONS[index];
            const scale = compact ? 0.72 : 1;
            return <View key={species.slug} style={{ position: 'absolute', left: position.left, bottom: position.bottom, transform: [{ translateX: -(position.size * scale) / 2 }] }}><PlantIllustration stage={species.slug === snapshot.activeSpecies.slug ? snapshot.stage : 'mature'} size={position.size * scale} speciesSlug={species.slug} /></View>;
          })}

          <View style={{ position: 'absolute', left: compact ? 14 : 24, bottom: compact ? 15 : 22, maxWidth: compact ? 235 : 340, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(16,48,32,0.86)' }}>
            <Text style={[theme.typography.label, { color: '#D7F28E', fontSize: 10, textTransform: 'uppercase', letterSpacing: .8 }]}>{t('Your habitat is taking shape', 'Твоето местообитание оживява')}</Text>
            <Text style={[theme.typography.bodySmall, { color: '#FFFFFF', fontSize: 12, marginTop: 3 }]}>{t('Trees, shrubs, flowers and wildlife build one connected forest edge.', 'Дървета, храсти, цветя и диви гости изграждат свързан горски край.')}</Text>
          </View>

          <View style={{ position: 'absolute', right: compact ? 14 : 22, bottom: compact ? 16 : 22, gap: 8, alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, backgroundColor: '#174C35' }}>
              <Text style={[theme.typography.label, { color: '#FFFFFF' }]}>{t('Explore', 'Разгледай')}</Text>
              <Ionicons name="arrow-forward" size={16} color="#B8E36B" />
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}
