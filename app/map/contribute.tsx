import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppButton, AppInput, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { sustainabilityMapService } from '@/features/sustainability-map';
import { useAppTheme } from '@/theme';
import { LocationCategory } from '@/types/map';
import { categoryConfig } from '@/utils/categoryUtils';

export default function MapContributionScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: string; locationId?: string; name?: string }>();
  const { user } = useAuth();
  const correction = params.kind === 'correction' && Boolean(params.locationId);
  const [name, setName] = useState(params.name || '');
  const [town, setTown] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [category, setCategory] = useState<LocationCategory>('local_organic');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const returnPath = correction ? `/map/contribute?kind=correction&locationId=${encodeURIComponent(params.locationId || '')}&name=${encodeURIComponent(params.name || '')}` : '/map/contribute';
  if (!user) return <Screen><Content><StatePanel icon="lock-closed-outline" title="Влез, за да допринесеш" message="Предложенията се свързват с профил, за да могат редакторите да проверят доказателствата и да наградят одобрените приноси." action={<AppButton label="Вход" onPress={() => router.replace({ pathname: '/auth/signin', params: { next: returnPath } })} />} /></Content></Screen>;

  const submit = async () => {
    setMessage('');
    const lat = Number(latitude); const lng = Number(longitude);
    if (!correction && (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180)) { setMessage('Въведи валидни географска ширина и дължина.'); return; }
    setBusy(true);
    try {
      await sustainabilityMapService.submitLocation(user.id, { kind: correction ? 'correction' : 'new_location', locationId: params.locationId || null, proposedData: { name, town, address, description, category_ids: [category], ...(Number.isFinite(lat) ? { latitude: lat } : {}), ...(Number.isFinite(lng) ? { longitude: lng } : {}) }, evidenceUrls: evidenceUrl ? [evidenceUrl] : [] });
      setMessage('Изпратено е за одобрение. Одобрено ново място носи 50 зелени точки.');
    } catch { setMessage('Изпращането не бе успешно.'); }
    finally { setBusy(false); }
  };

  return <Screen><ScrollView keyboardShouldPersistTaps="handled"><Content>
    <PageHeader eyebrow="Проверяван принос" title={correction ? `Коригирай ${params.name || 'това място'}` : 'Предложи устойчиво място'} description="Дай достатъчно проверима информация за мястото, категорията и лиценза. Нищо не се публикува автоматично." action={<AppButton label="Към картата" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <Card style={{ gap: theme.spacing.md }}>
      <AppInput label="Име на мястото" value={name} onChangeText={setName} placeholder="Бизнес, услуга или инициатива" />
      <AppInput label="Град" value={town} onChangeText={setTown} placeholder="София" />
      <AppInput label="Адрес" value={address} onChangeText={setAddress} placeholder="Улица и номер" />
      {!correction ? <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}><AppInput label="Географска ширина" value={latitude} onChangeText={setLatitude} keyboardType="decimal-pad" placeholder="42.6977" style={{ flex: 1 }} /><AppInput label="Географска дължина" value={longitude} onChangeText={setLongitude} keyboardType="decimal-pad" placeholder="23.3219" style={{ flex: 1 }} /></View> : null}
      <View style={{ gap: 8 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>Категория</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(Object.keys(categoryConfig) as LocationCategory[]).filter((id) => id !== 'community_events').map((id) => { const item = categoryConfig[id]; const active = category === id; return <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setCategory(id)} style={{ minHeight: 44, borderRadius: theme.radii.pill, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}><Ionicons name={item.icon as any} size={17} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.text }]}>{item.label}</Text></Pressable>; })}</View></View>
      <AppInput label="Доказателство за устойчивост" value={description} onChangeText={setDescription} multiline numberOfLines={5} placeholder="Опиши конкретната практика, сертификат или услуга и как могат да бъдат проверени." style={{ minHeight: 120, textAlignVertical: 'top', paddingTop: 12 }} />
      <AppInput label="Линк към доказателство (HTTPS)" value={evidenceUrl} onChangeText={setEvidenceUrl} autoCapitalize="none" keyboardType="url" placeholder="https://…" />
      {message ? <Text accessibilityLiveRegion="polite" style={[theme.typography.bodySmall, { color: message.startsWith('Изпратено') ? theme.colors.success : theme.colors.danger }]}>{message}</Text> : null}
      <AppButton label={correction ? 'Изпрати корекцията' : 'Изпрати за проверка'} icon="shield-checkmark-outline" loading={busy} onPress={() => void submit()} />
    </Card>
  </Content></ScrollView></Screen>;
}
