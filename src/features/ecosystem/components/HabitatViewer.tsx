import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useKnowledgeLocale } from '@/features/knowledge';
import { getBiomeCatalog } from '../catalog';
import { getHabitatPhase, HABITAT_DESCRIPTIONS, HABITAT_IMAGES, HABITAT_PHASE_LABELS } from '../habitatVisuals';
import type { EcosystemSnapshot } from '../types';

export function HabitatViewer({ snapshot, onClose }: { snapshot: EcosystemSnapshot; onClose: () => void }) {
  const { locale, t } = useKnowledgeLocale();
  const phase = getHabitatPhase(snapshot.growthUnits, snapshot.biome);
  const [zoomed, setZoomed] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const fittedWidth = Math.min(viewport.width, viewport.height * 16 / 9);
  const imageWidth = fittedWidth * (zoomed ? 2 : 1);
  const imageHeight = imageWidth * 9 / 16;
  return <Modal visible animationType="fade" onRequestClose={onClose} presentationStyle="fullScreen">
    <View accessibilityViewIsModal style={{ flex: 1, backgroundColor: '#0B1711', paddingTop: 48, paddingBottom: 24 }}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ flex: 1 }}><Text accessibilityRole="header" style={{ fontFamily: 'Manrope_700Bold', fontSize: 20, color: '#FFFFFF' }}>{getBiomeCatalog(snapshot.biome).name[locale]}</Text><Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: '#BDCDC0', marginTop: 4 }}>{HABITAT_PHASE_LABELS[phase][locale]}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={zoomed ? t('Show whole landscape', 'Покажи целия пейзаж') : t('Zoom into landscape', 'Увеличи пейзажа')} accessibilityState={{ selected: zoomed }} onPress={() => setZoomed(!zoomed)} style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#263D2E' }}><Ionicons name={zoomed ? 'remove' : 'add'} size={24} color="#FFFFFF" /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Close landscape', 'Затвори пейзажа')} onPress={onClose} style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#263D2E' }}><Ionicons name="close" size={24} color="#FFFFFF" /></Pressable>
      </View>
      <View testID="habitat-viewer-viewport" style={{ flex: 1, overflow: 'hidden' }} onLayout={({ nativeEvent: { layout } }) => setViewport({ width: layout.width, height: layout.height })}>
        {viewport.width > 0 && viewport.height > 0 ? <ScrollView key={zoomed ? 'detail' : 'whole'} scrollEnabled={zoomed} contentContainerStyle={{ minHeight: viewport.height }}>
          <ScrollView horizontal scrollEnabled={zoomed} style={{ height: Math.max(imageHeight, viewport.height), flexGrow: 0, flexShrink: 0 }} contentContainerStyle={{ minWidth: viewport.width, alignItems: 'center', justifyContent: 'center' }}>
            <Image testID="habitat-viewer-image" source={HABITAT_IMAGES[snapshot.biome][phase]} resizeMode="contain" accessibilityLabel={HABITAT_DESCRIPTIONS[snapshot.biome][locale]} style={{ width: imageWidth, height: imageHeight }} />
          </ScrollView>
        </ScrollView> : null}
      </View>
      <Text style={{ color: '#FFFFFF', fontFamily: 'Manrope_600SemiBold', fontSize: 12, textAlign: 'center', paddingHorizontal: 24, paddingTop: 16 }}>{zoomed ? t('Swipe to explore the details.', 'Плъзни, за да разгледаш детайлите.') : t('Tap + for a closer look.', 'Докосни +, за да разгледаш отблизо.')}</Text>
      <Text style={{ color: '#BDCDC0', fontFamily: 'Manrope_400Regular', fontSize: 14, textAlign: 'center', paddingHorizontal: 24, paddingTop: 16 }}>{HABITAT_DESCRIPTIONS[snapshot.biome][locale]}</Text>
    </View>
  </Modal>;
}
