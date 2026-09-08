import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { knowledgeService, useKnowledgeLocale, type KnowledgeItemDetail } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

type PathProgress = NonNullable<Awaited<ReturnType<typeof knowledgeService.getLearningPathProgress>>>;

export default function KnowledgePathScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const { locale, t } = useKnowledgeLocale();
  const router = useRouter();
  const [progress, setProgress] = useState<PathProgress | null>();
  const [items, setItems] = useState<KnowledgeItemDetail[]>([]);
  const [holderName, setHolderName] = useState('');
  const [certificateCode, setCertificateCode] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const result = await knowledgeService.getLearningPathProgress(user?.id, slug, locale);
    setProgress(result);
    if (result) setItems(await knowledgeService.getPublishedItems(locale));
  }, [user?.id, slug, locale]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  if (progress === undefined) return <Screen><Content><StatePanel title={t('Loading your path', 'Зареждане на пътеката')} message={t('Checking modules and assessments…', 'Проверка на модулите и оценките…')} /></Content></Screen>;
  if (!progress) return <Screen><Content><StatePanel title={t('Path unavailable', 'Пътеката не е налична')} message={t('Choose a published path from Knowledge Hub.', 'Изберете публикувана пътека от Центъра за знания.')} action={<AppButton label={t('Back to Hub', 'Назад към Центъра за знания')} onPress={() => router.replace('/knowledge' as any)} />} /></Content></Screen>;
  const openItem = (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    const route = item.type === 'simulation' ? `/knowledge/simulation/${item.id}` : item.type === 'quiz' ? `/knowledge/quiz/${item.id}` : `/knowledge/content/${item.slug}`;
    router.push(route as any);
  };
  const issue = async () => {
    setError('');
    try { const certificate = await knowledgeService.issueCertificate(user?.id, slug, holderName, locale); setCertificateCode(certificate.code); }
    catch (issueError) { setError(issueError instanceof Error ? issueError.message : t('Certificate could not be issued.', 'Сертификатът не може да бъде издаден.')); }
  };
  return <Screen><ScrollView><Content>
    <PageHeader eyebrow={t('Structured learning path', 'Структурирана учебна пътека')} title={progress.path.title} description={progress.path.summary} />
    <Card elevated style={{ backgroundColor: theme.colors.primary, marginBottom: 24 }}><Text style={[theme.typography.label, { color: theme.colors.accent }]}>{t('PATH PROGRESS', 'НАПРЕДЪК')}</Text><Text style={[theme.typography.display, { color: '#FFFFFF', marginTop: 8 }]}>{progress.percent}%</Text><View style={{ height: 8, backgroundColor: '#FFFFFF33', borderRadius: 4, overflow: 'hidden', marginTop: 14 }}><View style={{ height: '100%', width: `${progress.percent}%`, backgroundColor: theme.colors.accent }} /></View><Text style={[theme.typography.bodySmall, { color: '#D8EAE0', marginTop: 10 }]}>{progress.completedModules.length}/{progress.path.moduleItemIds.length} {t('modules', 'модула')} • {progress.passedQuizzes.length}/{progress.path.requiredQuizItemIds.length} {t('assessments', 'теста')}</Text></Card>
    <View style={{ gap: 12 }}>{progress.path.moduleItemIds.map((id, index) => { const item = items.find((entry) => entry.id === id); const complete = progress.completedModules.includes(id); return <Card key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: complete ? theme.colors.primarySoft : theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={complete ? 'checkmark' : 'book-outline'} size={20} color={complete ? theme.colors.success : theme.colors.textMuted} /></View><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{t('MODULE', 'МОДУЛ')} {index + 1}</Text><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 2 }]}>{item?.title || id.replace(/-/g, ' ')}</Text></View><AppButton label={complete ? t('Review', 'Преглед') : t('Start', 'Започни')} variant={complete ? 'ghost' : 'secondary'} onPress={() => openItem(id)} /></Card>; })}</View>
    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginTop: 30, marginBottom: 12 }]}>{t('Required assessment', 'Задължителен тест')}</Text>
    {progress.path.requiredQuizItemIds.map((id) => <Card key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><Ionicons name={progress.passedQuizzes.includes(id) ? 'ribbon' : 'help-circle-outline'} size={28} color={progress.passedQuizzes.includes(id) ? theme.colors.success : theme.colors.warning} /><Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]}>{id.replace(/-/g, ' ')}</Text><AppButton label={progress.passedQuizzes.includes(id) ? t('Passed', 'Издържан') : t('Take quiz', 'Започни тест')} variant="secondary" onPress={() => router.push(`/knowledge/quiz/${id}` as any)} /></Card>)}
    <Card elevated style={{ marginTop: 28, backgroundColor: theme.colors.accentSoft }}><Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Certificate of completion', 'Сертификат за завършване')}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 7 }]}>{t('Available after all modules and required assessments are complete. This is not an accredited qualification.', 'Достъпен след всички модули и задължителни тестове. Това не е академично призната квалификация.')}</Text><TextInput accessibilityLabel={t('Name on certificate', 'Име върху сертификата')} placeholder={t('Name on certificate', 'Име върху сертификата')} placeholderTextColor={theme.colors.textMuted} value={holderName} onChangeText={setHolderName} style={[theme.typography.body, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: theme.radii.md, minHeight: 50, paddingHorizontal: 14, marginTop: 16 }]} />{error ? <Text accessibilityLiveRegion="assertive" style={[theme.typography.bodySmall, { color: theme.colors.danger, marginTop: 8 }]}>{error}</Text> : null}<AppButton label={certificateCode ? t('Open certificate', 'Отвори сертификата') : t('Issue certificate', 'Издай сертификат')} icon="ribbon-outline" disabled={!progress.complete || !holderName.trim()} onPress={() => certificateCode ? router.push(`/knowledge/certificate/${certificateCode}` as any) : void issue()} style={{ marginTop: 12 }} /></Card>
  </Content></ScrollView></Screen>;
}
