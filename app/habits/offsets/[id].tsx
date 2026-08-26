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
  useEffect(() => { void offsettingService.getOffsetProjects().then((items) => setProject(items.find((item) => item.id === id) || null)).catch((value) => setError(value.message)).finally(() => setLoading(false)); }, [id]);
  const checkout = async () => {
    if (!project) return;
    setBusy(true); setError(null);
    try { const session = await offsettingService.createOffsetCheckout(project.id, Number(quantity)); await WebBrowser.openBrowserAsync(session.checkoutUrl); router.push('/habits/offsets/history' as any); }
    catch (value) { setError(value instanceof Error ? value.message : 'Secure checkout is unavailable.'); }
    finally { setBusy(false); }
  };
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    {loading ? <Skeleton height={300} /> : !project ? <StatePanel icon="leaf-outline" title="Project unavailable" message={error || 'This project is no longer in the reviewed catalog.'} action={<AppButton label="Back to projects" onPress={() => router.replace('/habits/offsets' as any)} />} /> : <>
      <PageHeader eyebrow={`${project.technology} · ${project.country}`} title={project.name} description={project.summary} action={<AppButton label="Back" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
      <View style={{ gap: theme.spacing.lg }}>
        {error ? <StatePanel icon="shield-outline" title="Checkout not started" message={error} /> : null}
        <Card style={{ gap: theme.spacing.sm }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>Verification details</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Standard: {project.standard}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Permanence: {project.permanence}</Text><AppButton label="Open provider registry information" icon="open-outline" variant="ghost" onPress={() => void Linking.openURL(project.registryUrl)} style={{ alignSelf: 'flex-start' }} /></Card>
        <Card elevated style={{ gap: theme.spacing.md }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>Choose contribution</Text><AppInput label="CO₂e to compensate (kg)" value={quantity} keyboardType="decimal-pad" onChangeText={setQuantity} /><Text style={[theme.typography.body, { color: theme.colors.text }]}>Indicative catalog price: {((Number(quantity) / 1000) * project.pricePerTonneMinor / 100).toFixed(2)} {project.currency}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.warning }]}>The provider checkout is authoritative for final price, inventory, certification and terms. Green Compass never receives your card details.</Text><AppButton label="Continue to secure Cloverly checkout" icon="open-outline" loading={busy} onPress={() => void checkout()} /></Card>
      </View>
    </>}
  </Content></ScrollView></Screen>;
}
