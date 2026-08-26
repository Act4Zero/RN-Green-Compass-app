import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ImageBackground, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useKnowledgeLocale } from '@/features/knowledge';
import { useAppTheme } from '@/theme';
import { STAGE_LABELS } from '../catalog';
import type { EcosystemSnapshot } from '../types';
import { PlantIllustration } from './PlantIllustration';

const BACKGROUND = require('../../../../assets/images/ecosystem/forest-meadow-background.webp');

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
        style={{ minHeight: compact ? 480 : 430, borderRadius: theme.radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: '#C9D8B6', ...theme.shadows.raised }}
      >
        <View style={{ flex: 1, padding: compact ? 18 : 28 }}>
          <View style={{ maxWidth: compact ? '100%' : 390, alignSelf: 'flex-start', padding: compact ? 16 : 20, borderRadius: 20, backgroundColor: 'rgba(255,252,239,0.93)', borderWidth: 1, borderColor: 'rgba(23,76,53,0.12)' }}>
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
          </View>

          <View style={{ position: 'absolute', left: compact ? '27%' : '48%', bottom: compact ? 30 : 18 }}>
            {loading ? <ActivityIndicator color="#174C35" /> : <PlantIllustration stage={snapshot.stage} size={compact ? 150 : 180} />}
          </View>

          <View style={{ position: 'absolute', right: compact ? 14 : 22, bottom: compact ? 16 : 22, gap: 8, alignItems: 'flex-end' }}>
            {snapshot.guests.slice(-3).map((guest) => (
              <View key={guest.slug} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,252,239,0.92)', borderWidth: 1, borderColor: 'rgba(23,76,53,0.12)' }}>
                <Ionicons name={guest.icon} size={16} color="#174C35" />
                <Text style={[theme.typography.label, { color: '#174C35', fontSize: 11 }]}>{guest.name[locale]}</Text>
              </View>
            ))}
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
