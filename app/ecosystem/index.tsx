import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, SegmentedControl } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { usePoints } from '@/context/PointsContext';
import { PointsGuide } from '@/components/community/points/PointsGuide';
import { useKnowledgeLocale } from '@/features/knowledge';
import { ECOSYSTEM_BIOMES, EcosystemHero, getBiomeCatalog, getEcosystemProgress, getSpeciesGrowth, PlantIllustration, STAGE_LABELS, STAGE_ORDER, useEcosystem } from '@/features/ecosystem';
import { getHabitatPhaseThresholds, HABITAT_DESCRIPTIONS, HABITAT_IMAGES, HABITAT_PHASES, HABITAT_PHASE_LABELS } from '@/features/ecosystem/habitatVisuals';
import { GUEST_EMOJI } from '@/features/ecosystem/components/HabitatScene';
import { GrowthActions } from '@/features/ecosystem/components/GrowthActions';
import { useAppTheme } from '@/theme';
import { goBackOrReplace } from '@/utils/navigation';

export default function EcosystemScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const { pointHistory, pointBalance } = usePoints();
  const { locale, t } = useKnowledgeLocale();
  const { snapshot, loading, saving, error, refresh, selectBiome } = useEcosystem(user?.id, pointHistory);
  const [tab, setTab] = useState('world');
  const [previewStep, setPreviewStep] = useState<number | null>(null);
  const [showPoints, setShowPoints] = useState(false);
  const wide = width >= 760;
  const biome = getBiomeCatalog(snapshot.biome);
  const previewSteps = getHabitatPhaseThresholds(snapshot.biome);
  const previewLabels = HABITAT_PHASES.map((phase) => HABITAT_PHASE_LABELS[phase][locale]);
  const previewUnits = previewStep == null ? null : previewSteps[previewStep];
  const displaySnapshot = previewUnits == null ? snapshot : {
    ...snapshot, ...getEcosystemProgress(previewUnits), activeSpecies: biome.species[0],
    unlockedSpecies: biome.species.filter((species) => species.unlockAt <= previewUnits),
    guests: biome.guests.filter((guest) => guest.unlockAt <= previewUnits),
    nextGuest: biome.guests.find((guest) => guest.unlockAt > previewUnits) || null,
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content wide>
          <PageHeader eyebrow={t('Small actions. A living world.', 'Малки стъпки. Жив свят.')} title={t('My green world 🌿', 'Моят зелен свят 🌿')}
            description={t('Watch your choices take root. Every plant has its own story.', 'Виж как изборите ти пускат корени. Всяко растение има своя история.')}
            action={<AppButton label={t('Home', 'Начало')} icon="arrow-back" variant="ghost" onPress={() => goBackOrReplace(router, '/home')} />} />

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {ECOSYSTEM_BIOMES.map((entry) => {
              const active = entry.id === snapshot.biome;
              return <Pressable key={entry.id} accessibilityRole="button" accessibilityState={{ selected: active, disabled: saving || loading }} disabled={saving || loading}
                accessibilityLabel={`${entry.name[locale]}. ${active ? t('Selected', 'Избрано') : t('Choose habitat', 'Избери местообитание')}`}
                onPress={() => { if (!active) { setPreviewStep(null); void selectBiome(entry.id); } }}
                style={({ pressed }) => ({ flex: 1, minHeight: wide ? 136 : 106, borderRadius: 18, overflow: 'hidden', borderWidth: 2, borderColor: active ? theme.colors.primary : theme.colors.border, opacity: pressed ? .85 : 1 })}>
                <ImageBackground source={HABITAT_IMAGES[entry.id].mature} resizeMode="cover" style={{ flex: 1, justifyContent: 'flex-end' }}>
                  {active ? <View style={{ position: 'absolute', top: 7, right: 7, borderRadius: 12, backgroundColor: '#174C35' }}><Ionicons name="checkmark-circle" size={22} color="#D7F28E" /></View> : null}
                  <View style={{ padding: wide ? 12 : 8, minHeight: 55, justifyContent: 'center', backgroundColor: 'rgba(11,37,25,.85)' }}>
                    <Text style={[theme.typography.label, { color: '#FFFFFF', fontSize: wide ? 15 : 12 }]}>{entry.name[locale]}</Text>
                  </View>
                </ImageBackground>
              </Pressable>;
            })}
          </View>
          {error ? <Card style={{ marginBottom: 16, gap: 10 }}><Text accessibilityRole="alert" style={[theme.typography.bodySmall, { color: theme.colors.danger }]}>{t('We could not refresh your world. Please try again.', 'Не успяхме да обновим твоя свят. Опитай отново.')}</Text><AppButton label={t('Try again', 'Опитай отново')} variant="secondary" onPress={() => void refresh()} /></Card> : null}
          <View style={{ marginBottom: 20 }}><SegmentedControl value={tab} onChange={setTab} options={[{ value: 'world', label: t('My world', 'Моят свят') }, { value: 'species', label: t('Species', 'Видове') }, { value: 'growth', label: t('How it grows', 'Как расте') }]} /></View>

          {tab === 'world' ? <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <Text style={[theme.typography.label, { color: theme.colors.textMuted, flex: 1 }]}>{previewStep == null ? t('Your progress, at your pace', 'Твоят напредък, с твоето темпо') : t('Preview · your progress is unchanged', 'Преглед · напредъкът ти е запазен')}</Text>
              <AppButton label={previewStep == null ? t('Look ahead', 'Поглед напред') : t('My growth', 'Моят растеж')} icon={previewStep == null ? 'eye-outline' : 'arrow-undo-outline'} variant="secondary" onPress={() => setPreviewStep(previewStep == null ? 2 : null)} style={{ paddingHorizontal: 14 }} />
            </View>
            {previewStep != null ? <Card style={{ padding: 12, marginBottom: 12, backgroundColor: theme.colors.accentSoft }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <AppButton label="←" accessibilityLabel={t('Previous growth stage', 'Предишен етап на растеж')} variant="ghost" disabled={previewStep === 0} onPress={() => setPreviewStep(previewStep - 1)} style={{ paddingHorizontal: 16 }} />
                <View style={{ flex: 1, alignItems: 'center' }}><Text style={[theme.typography.label, { color: theme.colors.text, textAlign: 'center' }]}>{previewLabels[previewStep]}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{previewStep + 1} / {previewSteps.length}</Text></View>
                <AppButton label="→" accessibilityLabel={t('Next growth stage', 'Следващ етап на растеж')} variant="ghost" disabled={previewStep === previewSteps.length - 1} onPress={() => setPreviewStep(previewStep + 1)} style={{ paddingHorizontal: 16 }} />
              </View>
            </Card> : null}
            <EcosystemHero snapshot={displaySnapshot} loading={loading} preview={previewStep != null} actionLabel={t('Meet the plants', 'Запознай се с растенията')} onOpen={() => setTab('species')} />
            <GrowthActions />
            <Card style={{ marginTop: 18, backgroundColor: theme.colors.primarySoft, gap: 8 }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('A place for every layer', 'Място за всеки природен етаж')}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{HABITAT_DESCRIPTIONS[snapshot.biome][locale]}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('You begin in an existing natural habitat. Your actions nurture the new growth; the old trees and the surrounding landscape remain. Your field guide records the species you discover along the way.', 'Започваш сред вече съществуваща природа. Действията ти развиват младата растителност, а старите дървета и пейзажът остават. Албумът отбелязва видовете, които откриваш по пътя.')}</Text>
              <Text style={[theme.typography.label, { color: theme.colors.primary }]}>{snapshot.biome === 'savanna' ? t('🌾 Grasses · 🌳 Scattered trees · 🐾 Wildlife', '🌾 Треви · 🌳 Рехави дървета · 🐾 Животни') : t('🌱 Ground cover · 🌿 Understory · 🌳 Canopy', '🌱 Почвен покрив · 🌿 Подлес · 🌳 Корони')}</Text>
            </Card>
          </> : null}

          {tab === 'species' ? <>
            <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 6 }]}>{t('Your field guide', 'Твоят природен албум')}</Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginBottom: 18 }]}>{t('Meet every species, including those you will unlock next.', 'Разгледай всеки вид, включително тези, които ти предстои да откриеш.')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {biome.species.map((species) => {
                const unlocked = species.unlockAt <= snapshot.growthUnits;
                const active = snapshot.activeSpecies.slug === species.slug;
                const growth = getSpeciesGrowth(snapshot.growthUnits, species);
                return <Pressable key={species.slug} accessibilityRole="button" accessibilityLabel={`${species.name[locale]}. ${unlocked ? STAGE_LABELS[growth.stage][locale] : t(`Unlocks at ${species.unlockAt} growth`, `Отключва се при ${species.unlockAt} растеж`)}`}
                  onPress={() => router.push(`/ecosystem/species/${species.slug}` as any)}
                  style={({ pressed }) => ({ flexBasis: wide ? '23%' : '47%', flexGrow: 1, maxWidth: wide ? '25%' : '50%', padding: 14, borderRadius: 20, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: theme.colors.surface, opacity: pressed ? .85 : 1 })}>
                  <View style={{ height: 124, borderRadius: 14, backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 12 }}>
                    <PlantIllustration stage="mature" size={114} speciesSlug={species.slug} />
                    {!unlocked ? <View style={{ position: 'absolute', top: 7, right: 7, padding: 6, borderRadius: 12, backgroundColor: theme.colors.surface }}><Ionicons name="lock-closed-outline" size={15} color={theme.colors.textMuted} /></View> : null}
                  </View>
                  <Text style={[theme.typography.label, { color: theme.colors.text, fontSize: 14 }]}>{species.name[locale]}</Text>
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11, marginTop: 3, fontStyle: 'italic' }]}>{species.scientificName}</Text>
                  <Text style={[theme.typography.label, { color: theme.colors.primary, marginTop: 10, fontSize: 11 }]}>{unlocked ? `${active ? '✓ ' : ''}${STAGE_LABELS[growth.stage][locale]}` : t(`${species.unlockAt - snapshot.growthUnits} growth to discover`, `След още ${species.unlockAt - snapshot.growthUnits} растеж`)}</Text>
                </Pressable>;
              })}
            </View>
            <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginTop: 28, marginBottom: 14 }]}>{t('Wild visitors', 'Гости от природата')}</Text>
            <View style={{ gap: 10 }}>{biome.guests.map((guest) => {
              const unlocked = guest.unlockAt <= snapshot.growthUnits;
              return <Card key={guest.slug} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Text style={{ fontSize: 30 }} accessibilityElementsHidden>{GUEST_EMOJI[guest.slug]}</Text>
                <View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{guest.name[locale]}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{unlocked ? guest.message[locale] : t(`Arrives at ${guest.unlockAt} growth`, `Ще те посети при ${guest.unlockAt} растеж`)}</Text></View>
                <Ionicons name={unlocked ? 'checkmark-circle' : 'lock-closed-outline'} size={20} color={theme.colors.primary} />
              </Card>;
            })}</View>
          </> : null}

          {tab === 'growth' ? <>
            <GrowthActions />
            <Card style={{ marginTop: 20, gap: 14 }}>
              <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('New life in a growing habitat', 'Нов живот в развиващата се природа')}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('The landscape develops through four views: new growth, young vegetation, a thriving habitat and natural renewal. New generations join the old trees.', 'Пейзажът преминава през четири изгледа: начален растеж, млада растителност, развито местообитание и естествено подновяване. Новите поколения растат редом със старите дървета.')}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Each new plant starts small and develops with your next actions. Choosing a favourite does not change its age.', 'Всяко ново растение започва малко и се развива със следващите ти действия. Изборът на любим вид не променя възрастта му.')}</Text>
              {STAGE_ORDER.map((stage, index) => <View key={stage} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20 }}>{['🫘', '🌱', '🌿', '🌳', '🌳'][index]}</Text></View>
                <Text style={[theme.typography.body, { color: theme.colors.text }]}>{STAGE_LABELS[stage][locale]}</Text>
              </View>)}
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('All species are discovered at 528 growth. The newest plants keep developing after that, followed by a new generation in the open spaces. A break does not erase your progress.', 'При 528 растеж всички видове са открити. Най-новите растения продължават да се развиват и след това, а на свободните места пониква ново поколение. Почивката не изтрива напредъка ти.')}</Text>
            </Card>
            <Card style={{ marginTop: 16, gap: 12 }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Your rewards', 'Твоите награди')}</Text>
              <Text style={[theme.typography.body, { color: theme.colors.text }]}>{t(`⭐ ${pointBalance.total} green points · 🌱 ${snapshot.growthUnits} growth`, `⭐ ${pointBalance.total} зелени точки · 🌱 ${snapshot.growthUnits} растеж`)}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Points record your achievements. Growth develops your virtual habitat. Opening the app alone does not add growth.', 'Точките отбелязват постиженията ти. Растежът развива виртуалното местообитание. Самото отваряне на приложението не добавя растеж.')}</Text>
              <AppButton label={showPoints ? t('Hide point rules', 'Скрий правилата за точки') : t('See point rules', 'Виж правилата за точки')} variant="ghost" onPress={() => setShowPoints(!showPoints)} />
              {showPoints ? <PointsGuide compact /> : null}
            </Card>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 20 }]}>{t('Inspired by nature. This is an illustrated learning world with selected species, not a simulation of ecological time or a measure of real restoration.', 'Вдъхновено от природата. Това е илюстриран образователен свят с подбрани видове, а не симулация на природното време или измерване на реално възстановена природа.')}</Text>
          </> : null}
        </Content>
      </ScrollView>
    </Screen>
  );
}
