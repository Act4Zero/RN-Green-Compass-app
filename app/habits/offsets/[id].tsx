import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { AppButton, AppInput, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { offsettingService, type OffsetProject } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

export default function OffsetProjectDetailScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<OffsetProject | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void offsettingService.getOffsetProjects().then((items) => setProject(items.find((item) => item.id === id) || null)).catch(() => setError('Проектът не можа да бъде зареден.')).finally(() => setLoading(false)); }, [id]);
  const checkout = async () => {
    if (!project) return;
    setBusy(true); setError(null);
    try { const session = await offsettingService.createOffsetCheckout(project.id, Number(quantity)); await WebBrowser.openBrowserAsync(session.checkoutUrl); router.push('/habits/offsets/history' as any); }
    catch { setError('Защитеното плащане не е достъпно.'); }
    finally { setBusy(false); }
  };
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    {loading ? <Skeleton height={300} /> : !project ? <StatePanel icon="leaf-outline" title="Проектът не е достъпен" message={error || 'Този проект вече не е в проверения каталог.'} action={<AppButton label="Към проектите" onPress={() => router.replace('/habits/offsets' as any)} />} /> : <>
      <PageHeader eyebrow={`${project.technology} · ${project.country}`} title={project.name} description={project.summary} action={<AppButton label="Назад" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
      <View style={{ gap: theme.spacing.lg }}>
        {error ? <StatePanel icon="shield-outline" title="Плащането не е започнато" message={error} /> : null}
        <Card style={{ gap: theme.spacing.sm }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>Данни за проверката</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Стандарт: {project.standard}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Трайност: {project.permanence}</Text><AppButton label="Отвори регистъра на доставчика" icon="open-outline" variant="ghost" onPress={() => void Linking.openURL(project.registryUrl)} style={{ alignSelf: 'flex-start' }} /></Card>
        <Card elevated style={{ gap: theme.spacing.md }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>Избери принос</Text><AppInput label="CO₂e за компенсиране (kg)" value={quantity} keyboardType="decimal-pad" onChangeText={setQuantity} /><Text style={[theme.typography.body, { color: theme.colors.text }]}>Ориентировъчна цена: {((Number(quantity) / 1000) * project.pricePerTonneMinor / 100).toFixed(2)} {project.currency}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.warning }]}>Страницата на доставчика определя крайната цена, наличността, сертификацията и условията. Green Compass никога не получава данните на картата ти.</Text><AppButton label="Продължи към защитеното плащане в Cloverly" icon="open-outline" loading={busy} onPress={() => void checkout()} /></Card>
      </View>
    </>}
  </Content></ScrollView></Screen>;
}
