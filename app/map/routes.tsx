import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAppLocale } from '@/context/AppLocaleContext';
import { sustainabilityMapService } from '@/features/sustainability-map';
import { useAppTheme } from '@/theme';
import { EcoRoute } from '@/types/map';
import { formatAddress, getPlatformSpecificNavigationUrl } from '@/utils/mapUtils';

export default function EcoRoutesScreen() {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const router = useRouter();
  const [routes, setRoutes] = useState<EcoRoute[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void sustainabilityMapService.listRoutes().then(setRoutes).catch(() => setError(t('Unable to load routes.', 'Маршрутите не могат да бъдат заредени.')));
  }, [t]);

  return <Screen><ScrollView><Content wide>
    <PageHeader eyebrow={t('Curated discovery', 'Подбрани места')} title={t('Eco‑Tour routes', 'Еко маршрути')} description={t('Editor-reviewed routes connect verified places around one practical sustainability theme. Navigation opens one stop at a time in your preferred maps app.', 'Проверените от редактор маршрути свързват устойчиви места около практична тема. Навигацията отваря всяка спирка в предпочитаното приложение за карти.')} action={<AppButton label={t('Back to map', 'Назад към картата')} icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    {error ? <StatePanel icon="alert-circle-outline" title={t('Routes unavailable', 'Маршрутите не са достъпни')} message={error} /> : !routes ? <Skeleton height={220} /> : routes.length === 0 ? <StatePanel icon="trail-sign-outline" title={t('Routes are being curated', 'Подготвяме маршрутите')} message={t('The route layer stays hidden until editors publish a complete sequence of verified stops.', 'Слоят с маршрути ще се появи, когато редакторите публикуват пълна поредица от проверени спирки.')} /> : <View style={{ gap: theme.spacing.lg }}>
      {routes.map((route) => <Card key={route.id} elevated style={{ gap: theme.spacing.md }}>
        <View><Text style={[theme.typography.h2, { color: theme.colors.text }]}>{route.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{route.durationMinutes} {t('min', 'мин')} · {route.stops.length} {t('stops', 'спирки')}</Text></View>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{route.description}</Text>
        {route.stops.map((stop) => <View key={stop.order} style={{ flexDirection: 'row', gap: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.border }}><View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }}><Text style={[theme.typography.label, { color: theme.colors.textInverse }]}>{stop.order}</Text></View><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{stop.location.name}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{stop.note || formatAddress(stop.location)}</Text></View><AppButton label={t('Navigate', 'Навигация')} icon="navigate-outline" variant="ghost" onPress={() => void Linking.openURL(getPlatformSpecificNavigationUrl(stop.location.lat, stop.location.lng, stop.location.name, formatAddress(stop.location)))} /></View>)}
      </Card>)}
    </View>}
  </Content></ScrollView></Screen>;
}
