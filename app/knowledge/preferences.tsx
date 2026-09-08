import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { KNOWLEDGE_TOPICS, knowledgeService, localizedTopic, useKnowledgeLocale, type KnowledgePreferences } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function KnowledgePreferencesScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const { locale, t } = useKnowledgeLocale();
  const router = useRouter();
  const [preference, setPreference] = useState<KnowledgePreferences | null>(null);
  const [saving, setSaving] = useState(false);
  useFocusEffect(useCallback(() => { void knowledgeService.getPreferences(user?.id, locale).then(setPreference); }, [user?.id, locale]));
  if (!preference) return <Screen><Content><PageHeader eyebrow={t('Personalisation', 'Персонализация')} title={t('Learning interests', 'Учебни интереси')} /></Content></Screen>;
  const toggle = (slug: string) => setPreference((current) => current ? { ...current, topicSlugs: current.topicSlugs.includes(slug) ? current.topicSlugs.filter((entry) => entry !== slug) : current.topicSlugs.length < 5 ? [...current.topicSlugs, slug] : current.topicSlugs } : current);
  const save = async () => { setSaving(true); await knowledgeService.setPreferences(user?.id, { ...preference, locale, onboardingComplete: true, updatedAt: new Date().toISOString() }); setSaving(false); router.back(); };
  return <Screen><ScrollView><Content><PageHeader eyebrow={t('Personalisation', 'Персонализация')} title={t('Learning interests', 'Учебни интереси')} description={t('Choose up to five topics. The Hub uses them to order recommendations; the complete library always remains open.', 'Изберете до пет теми. Центърът за знания ги използва за подреждане на препоръките; цялата библиотека остава отворена.')} />
    <Card><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{KNOWLEDGE_TOPICS.map((topic) => { const active = preference.topicSlugs.includes(topic.slug); const copy = localizedTopic(topic, locale); return <Pressable key={topic.slug} accessibilityRole="checkbox" accessibilityState={{ checked: active }} accessibilityLabel={copy.name} onPress={() => toggle(topic.slug)} style={{ width: '48%', minWidth: 150, minHeight: 94, borderWidth: 1, borderColor: active ? topic.visual.palette.primary : theme.colors.border, backgroundColor: active ? topic.visual.palette.surface : theme.colors.surface, borderRadius: theme.radii.md, padding: 14, justifyContent: 'center' }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{copy.name}</Text><Text numberOfLines={2} style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{copy.description}</Text></Pressable>; })}</View><Text accessibilityLiveRegion="polite" style={[theme.typography.bodySmall, { color: preference.topicSlugs.length >= 5 ? theme.colors.warning : theme.colors.textMuted, marginTop: 14 }]}>{preference.topicSlugs.length}/5 {t('topics selected', 'избрани теми')}</Text></Card>
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}><AppButton label={t('Save interests', 'Запази интересите')} loading={saving} onPress={() => void save()} style={{ flex: 1 }} /><AppButton label={t('Clear', 'Изчисти')} variant="secondary" onPress={() => setPreference({ ...preference, topicSlugs: [] })} /></View>
  </Content></ScrollView></Screen>;
}
