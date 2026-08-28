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
  if (!user) return <Screen><Content><StatePanel icon="lock-closed-outline" title="Sign in to contribute" message="Suggestions are linked to an account so editors can review evidence and reward approved contributions." action={<AppButton label="Sign in" onPress={() => router.replace({ pathname: '/auth/signin', params: { next: returnPath } })} />} /></Content></Screen>;

  const submit = async () => {
    setMessage('');
    const lat = Number(latitude); const lng = Number(longitude);
    if (!correction && (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180)) { setMessage('Enter valid latitude and longitude for the new place.'); return; }
    setBusy(true);
    try {
      await sustainabilityMapService.submitLocation(user.id, { kind: correction ? 'correction' : 'new_location', locationId: params.locationId || null, proposedData: { name, town, address, description, category_ids: [category], ...(Number.isFinite(lat) ? { latitude: lat } : {}), ...(Number.isFinite(lng) ? { longitude: lng } : {}) }, evidenceUrls: evidenceUrl ? [evidenceUrl] : [] });
      setMessage('Submitted for reviewer approval. If approved, a new location contribution earns 50 Green Points.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Submission failed.'); }
    finally { setBusy(false); }
  };

  return <Screen><ScrollView keyboardShouldPersistTaps="handled"><Content>
    <PageHeader eyebrow="Moderated contribution" title={correction ? `Correct ${params.name || 'this place'}` : 'Suggest a sustainable place'} description="Give editors enough verifiable information to confirm the listing, category and licence. Nothing is published automatically." action={<AppButton label="Back to map" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <Card style={{ gap: theme.spacing.md }}>
      <AppInput label="Place name" value={name} onChangeText={setName} placeholder="Business, service or initiative" />
      <AppInput label="Town" value={town} onChangeText={setTown} placeholder="Sofia" />
      <AppInput label="Address" value={address} onChangeText={setAddress} placeholder="Street and number" />
      {!correction ? <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}><AppInput label="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="decimal-pad" placeholder="42.6977" style={{ flex: 1 }} /><AppInput label="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="decimal-pad" placeholder="23.3219" style={{ flex: 1 }} /></View> : null}
      <View style={{ gap: 8 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>Category</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(Object.keys(categoryConfig) as LocationCategory[]).filter((id) => id !== 'community_events').map((id) => { const item = categoryConfig[id]; const active = category === id; return <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setCategory(id)} style={{ minHeight: 44, borderRadius: theme.radii.pill, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}><Ionicons name={item.icon as any} size={17} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.text }]}>{item.label}</Text></Pressable>; })}</View></View>
      <AppInput label="Sustainability evidence" value={description} onChangeText={setDescription} multiline numberOfLines={5} placeholder="Describe the specific practice, certification or service and how it can be verified." style={{ minHeight: 120, textAlignVertical: 'top', paddingTop: 12 }} />
      <AppInput label="Evidence URL (HTTPS)" value={evidenceUrl} onChangeText={setEvidenceUrl} autoCapitalize="none" keyboardType="url" placeholder="https://…" />
      {message ? <Text accessibilityLiveRegion="polite" style={[theme.typography.bodySmall, { color: message.startsWith('Submitted') ? theme.colors.success : theme.colors.danger }]}>{message}</Text> : null}
      <AppButton label={correction ? 'Submit correction' : 'Submit for verification'} icon="shield-checkmark-outline" loading={busy} onPress={() => void submit()} />
    </Card>
  </Content></ScrollView></Screen>;
}
