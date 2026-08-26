import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { usePoints } from '@/context/PointsContext';
import { FOREST_MEADOW_SPECIES, useEcosystem } from '@/features/ecosystem';
import { useKnowledgeLocale } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function EcosystemSpeciesScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { theme } = useAppTheme();
  const { locale, t } = useKnowledgeLocale();
  const { user } = useAuth();
  const { pointHistory } = usePoints();
  const { snapshot, selectSpecies } = useEcosystem(user?.id, pointHistory);
  const species = FOREST_MEADOW_SPECIES.find((entry) => entry.slug === slug);

  if (!species) {
    return <Screen><Content><StatePanel title={t('Species not found', 'Видът не е намерен')} message={t('Return to your ecosystem and choose another plant.', 'Върни се в екосистемата и избери друго растение.')} action={<AppButton label={t('Back', 'Назад')} onPress={() => router.back()} />} /></Content></Screen>;
  }

  const unlocked = snapshot.growthUnits >= species.unlockAt;
  const active = snapshot.activeSpecies.slug === species.slug;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          <PageHeader eyebrow={t('Species field note', 'Полеви бележки за вида')} title={species.name[locale]} description={species.scientificName} action={<AppButton label={t('Back', 'Назад')} icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
          <Card elevated style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
            <View style={{ minHeight: 210, padding: 28, justifyContent: 'flex-end', backgroundColor: theme.colors.primary }}>
              <View style={{ position: 'absolute', right: -20, top: -30, width: 210, height: 210, borderRadius: 105, backgroundColor: theme.colors.accent, opacity: 0.15 }} />
              <Ionicons name="leaf" size={58} color={theme.colors.accent} />
              <Text style={[theme.typography.h1, { color: '#FFFFFF', marginTop: 16 }]}>{species.name[locale]}</Text>
              <Text style={[theme.typography.body, { color: '#D8EAE0', fontStyle: 'italic', marginTop: 3 }]}>{species.scientificName}</Text>
            </View>
          </Card>

          <View style={{ gap: 12 }}>
            <Card style={{ padding: 20 }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{t('Meet the species', 'Запознай се с вида')}</Text><Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 8 }]}>{species.shortDescription[locale]}</Text></Card>
            <Card style={{ padding: 20 }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{t('Curious detail', 'Любопитен детайл')}</Text><Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 8 }]}>{species.curiosity[locale]}</Text></Card>
            <Card style={{ padding: 20 }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{t('Where it feels at home', 'Къде се чувства у дома')}</Text><Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 8 }]}>{species.habitat[locale]}</Text></Card>
          </View>

          <Card style={{ padding: 20, marginTop: 18, marginBottom: 18, backgroundColor: theme.colors.accentSoft }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.primary} /><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Source', 'Източник')}</Text></View>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginVertical: 9 }]}>{t('Scientific names and species references are linked to an authoritative botanical database.', 'Научните имена и справките за видовете са свързани с авторитетна ботаническа база данни.')}</Text>
            <AppButton label={species.sourceLabel} variant="ghost" icon="open-outline" onPress={() => void Linking.openURL(species.sourceUrl)} />
          </Card>

          {unlocked ? (
            <AppButton disabled={active} label={active ? t('Currently growing', 'В момента отглеждаш този вид') : t('Grow this species', 'Отглеждай този вид')} icon={active ? 'checkmark-circle-outline' : 'leaf-outline'} onPress={async () => { const selected = await selectSpecies(species.slug); if (selected) router.back(); }} style={{ marginBottom: 32 }} />
          ) : (
            <StatePanel icon="lock-closed-outline" title={t('Not unlocked yet', 'Все още не е отключен')} message={t(`This species joins your collection at ${species.unlockAt} growth units. You currently have ${snapshot.growthUnits}.`, `Този вид се добавя при ${species.unlockAt} единици растеж. В момента имаш ${snapshot.growthUnits}.`)} />
          )}
        </Content>
      </ScrollView>
    </Screen>
  );
}
