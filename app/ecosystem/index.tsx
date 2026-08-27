import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { usePoints } from '@/context/PointsContext';
import { useKnowledgeLocale } from '@/features/knowledge';
import { EcosystemHero, FOREST_MEADOW_GUESTS, FOREST_MEADOW_SPECIES, PlantIllustration, STAGE_LABELS, STAGE_ORDER, useEcosystem } from '@/features/ecosystem';
import { useAppTheme } from '@/theme';
import { goBackOrReplace } from '@/utils/navigation';

export default function EcosystemScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const { pointHistory } = usePoints();
  const { locale, t } = useKnowledgeLocale();
  const { snapshot, loading, selectSpecies } = useEcosystem(user?.id, pointHistory);
  const wide = width >= 760;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content wide>
          <PageHeader
            eyebrow={t('Forest & meadow', 'Гора и поляна')}
            title={t('Your living ecosystem', 'Твоята жива екосистема')}
            description={t('Meaningful actions grow this world. Plants never wither, and every new species opens a short piece of real nature knowledge.', 'Смислените действия развиват този свят. Растенията никога не увяхват, а всеки нов вид отключва кратко и достоверно природно знание.')}
            action={<AppButton label={t('Back', 'Назад')} icon="arrow-back" variant="ghost" onPress={() => goBackOrReplace(router, '/more')} />}
          />

          <EcosystemHero
            snapshot={snapshot}
            loading={loading}
            onOpen={() => router.push(`/ecosystem/species/${snapshot.activeSpecies.slug}` as any)}
          />

          <Card style={{ padding: wide ? 24 : 19, marginBottom: 18, backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.borderStrong }}>
            <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'flex-start', gap: 18 }}>
              <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="layers-outline" size={25} color={theme.colors.accent} /></View>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: .9 }]}>{t('What they form together', 'Какво образуват заедно')}</Text>
                <Text style={[theme.typography.h2, { color: theme.colors.text, marginTop: 5 }]}>{t('A layered forest edge—not a row of separate pots', 'Многослоен горски край — не редица отделни саксии')}</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 6 }]}>{t('Oak and lime shape the canopy; cornelian cherry and dog rose create shelter below; yarrow, clover, poppy and daisy turn the ground layer into a living meadow.', 'Дъбът и липата оформят короните; дрянът и шипката създават укритие отдолу; равнецът, детелината, макът и маргаритката превръщат приземния слой в жива поляна.')}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { icon: 'leaf-outline' as const, en: 'Canopy', bg: 'Корони' },
                  { icon: 'git-branch-outline' as const, en: 'Shrubs', bg: 'Храсти' },
                  { icon: 'flower-outline' as const, en: 'Meadow', bg: 'Поляна' },
                ].map((layer) => <View key={layer.en} style={{ alignItems: 'center', gap: 5 }}><View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={layer.icon} size={19} color={theme.colors.primary} /></View><Text style={[theme.typography.label, { color: theme.colors.textMuted, fontSize: 9 }]}>{locale === 'bg' ? layer.bg : layer.en}</Text></View>)}
              </View>
            </View>
          </Card>

          <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16, marginBottom: 30 }}>
            <Card style={{ flex: 1, padding: 20 }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Five calm stages', 'Пет спокойни етапа')}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 5, marginBottom: 18 }]}>{t('There is no punishment or decay. Your progress is permanent.', 'Няма наказание или увяхване. Напредъкът ти е постоянен.')}</Text>
              <View style={{ gap: 12 }}>
                {STAGE_ORDER.map((stage, index) => {
                  const reached = index <= snapshot.stageIndex;
                  return (
                    <View key={stage} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: reached ? theme.colors.primary : theme.colors.surfaceMuted }}>
                        <Ionicons name={reached ? 'checkmark' : 'ellipse-outline'} size={16} color={reached ? theme.colors.accent : theme.colors.textMuted} />
                      </View>
                      <Text style={[theme.typography.body, { color: reached ? theme.colors.text : theme.colors.textMuted }]}>{STAGE_LABELS[stage][locale]}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            <Card style={{ flex: 1, padding: 20 }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Wild guests', 'Диви гости')}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 5, marginBottom: 18 }]}>{t('Different kinds of action make the habitat more welcoming.', 'Различните видове действия правят местообитанието по-гостоприемно.')}</Text>
              <View style={{ gap: 12 }}>
                {FOREST_MEADOW_GUESTS.map((guest) => {
                  const unlocked = snapshot.growthUnits >= guest.unlockAt;
                  return (
                    <View key={guest.slug} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', opacity: unlocked ? 1 : 0.48 }}>
                      <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: unlocked ? theme.colors.accentSoft : theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={unlocked ? guest.icon : 'lock-closed-outline'} size={18} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[theme.typography.label, { color: theme.colors.text }]}>{guest.name[locale]}</Text>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 12 }]}>{unlocked ? guest.message[locale] : t(`Unlocks at ${guest.unlockAt} growth`, `Отключва се при ${guest.unlockAt} растеж`)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          </View>

          <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 6 }]}>{t('Species collection', 'Колекция от видове')}</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted, marginBottom: 16 }]}>{t('Choose any unlocked plant as the focus of your world.', 'Избери всяко отключено растение като фокус на твоя свят.')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
            {FOREST_MEADOW_SPECIES.map((species) => {
              const unlocked = snapshot.growthUnits >= species.unlockAt;
              const active = snapshot.activeSpecies.slug === species.slug;
              return (
                <Pressable
                  key={species.slug}
                  accessibilityRole="button"
                  accessibilityLabel={unlocked ? `${species.name[locale]}. ${active ? t('Selected', 'Избрано') : t('Open species', 'Отвори вида')}` : `${species.name[locale]}. ${t('Locked', 'Заключено')}`}
                  onPress={() => unlocked && router.push(`/ecosystem/species/${species.slug}` as any)}
                  style={({ pressed }) => ({ width: wide ? '31.8%' : '100%', minHeight: 150, padding: 18, borderRadius: theme.radii.lg, borderWidth: active ? 2 : 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface, opacity: unlocked ? (pressed ? 0.82 : 1) : 0.55 })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ width: 58, height: 58, borderRadius: 17, backgroundColor: unlocked ? theme.colors.accentSoft : theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {unlocked ? <PlantIllustration stage="mature" size={54} speciesSlug={species.slug} /> : <Ionicons name="lock-closed-outline" size={21} color={theme.colors.primary} />}
                    </View>
                    {active ? <View style={{ paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: theme.colors.primary }}><Text style={[theme.typography.label, { color: theme.colors.textInverse, fontSize: 10 }]}>{t('Growing', 'Отглеждаш')}</Text></View> : null}
                  </View>
                  <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 14 }]}>{species.name[locale]}</Text>
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontStyle: 'italic', marginTop: 2 }]}>{species.scientificName}</Text>
                  {!unlocked ? <Text style={[theme.typography.label, { color: theme.colors.primary, marginTop: 10 }]}>{species.unlockAt} {t('growth', 'растеж')}</Text> : null}
                </Pressable>
              );
            })}
          </View>

          {snapshot.unlockedSpecies.length > 1 ? (
            <Card style={{ padding: 18, marginBottom: 28, flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'flex-start', gap: 14, backgroundColor: theme.colors.accentSoft }}>
              <Ionicons name="swap-horizontal-outline" size={24} color={theme.colors.primary} />
              <Text style={[theme.typography.body, { flex: 1, color: theme.colors.text }]}>{t('Ready for a change? Select an unlocked species from its detail page. Your total growth stays the same.', 'Искаш промяна? Избери отключен вид от страницата му. Общият ти растеж се запазва.')}</Text>
              <AppButton label={t('Use first unlocked', 'Избери първия отключен')} variant="secondary" onPress={() => void selectSpecies(snapshot.unlockedSpecies[1].slug)} />
            </Card>
          ) : null}
        </Content>
      </ScrollView>
    </Screen>
  );
}
