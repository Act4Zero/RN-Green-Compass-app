import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { sustainabilityMapService } from '@/features/sustainability-map';
import analyticsService from '@/services/analyticsService';
import { useMapIntegration } from '@/hooks/useMapIntegration';
import { useAppTheme } from '@/theme';
import { MapLocation } from '@/types/map';
import { getCategoryConfig } from '@/utils/categoryUtils';
import { distanceFromPoint } from '@/utils/mapGlobe';
import { getPlatformSpecificNavigationUrl } from '@/utils/mapUtils';
import { useAuth } from '@/context/AuthContext';
import { useAppLocale } from '@/context/AppLocaleContext';
import { formatLocalizedAddress, getLocalizedLocationName } from '@/utils/mapUtils';

function Detail({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const { theme } = useAppTheme();
  return <View style={{ flex: 1, minWidth: 120, padding: theme.spacing.sm, borderRadius: theme.radii.md, backgroundColor: theme.colors.surfaceMuted, gap: 4 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ionicons name={icon} size={16} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.textMuted, fontSize: 11 }]}>{label}</Text></View><Text style={[theme.typography.label, { color: theme.colors.text }]}>{value}</Text></View>;
}

export default function MapPopup({ location }: { location: MapLocation }) {
  const map = useMapIntegration();
  const router = useRouter();
  const { user } = useAuth();
  const { locale, t } = useAppLocale();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const [checkInState, setCheckInState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [checkInMessage, setCheckInMessage] = useState('');
  const desktop = width >= theme.breakpoints.desktop;
  const distance = distanceFromPoint(location, map.userLocation);
  const address = formatLocalizedAddress(location, locale);
  const locationName = getLocalizedLocationName(location, locale);
  const category = getCategoryConfig(location.category);
  const isEvent = location.id.startsWith('event:');

  const navigate = async () => {
    const url = getPlatformSpecificNavigationUrl(location.lat, location.lng, locationName, address);
    analyticsService.trackEvent('map_navigation_opened', { location_id: location.id, platform: Platform.OS });
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  };

  const checkIn = async () => {
    if (!user) {
      router.push({ pathname: '/auth/signin', params: { next: `/map?place=${encodeURIComponent(location.id)}` } });
      return;
    }
    setCheckInState('loading');
    try {
      const result = await sustainabilityMapService.checkIn(location.id);
      setCheckInState('done');
      setCheckInMessage(result.firstVisit ? t(`First visit recorded · +${result.pointsAwarded} Green Points`, `Първото посещение е записано · +${result.pointsAwarded} зелени точки`) : t('Today’s visit was recorded.', 'Днешното посещение е записано.'));
      analyticsService.trackEvent('map_checkin_completed', { location_id: location.id, first_visit: result.firstVisit });
    } catch (error) {
      setCheckInState('error');
      setCheckInMessage(error instanceof Error ? error.message : t('Check-in failed.', 'Неуспешен check-in.'));
    }
  };

  return <View style={[theme.shadows.raised, { position: 'absolute', zIndex: 70, backgroundColor: theme.colors.backgroundElevated, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden', ...(desktop ? { right: 20, top: 146, bottom: 54, width: 410, borderRadius: theme.radii.xl } : { left: 12, right: 12, bottom: 14, maxHeight: '68%', borderRadius: theme.radii.xl }) }]}>
    <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }}><Ionicons name={category.icon as any} size={23} color={theme.colors.accent} /></View>
        <View style={{ flex: 1, gap: 3 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Text accessibilityRole="header" style={[theme.typography.h3, { color: theme.colors.text, flexShrink: 1 }]}>{locationName}</Text>{location.verified ? <Ionicons accessibilityLabel={t('Verified location', 'Проверено място')} name="shield-checkmark" size={18} color={theme.colors.primary} /> : null}</View><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{address || location.town || t(category.label, category.labelBg)}</Text>{location.rating ? <Text accessibilityLabel={t(`${location.rating} out of 5 from ${location.review_count} reviews`, `${location.rating} от 5 от ${location.review_count} отзива`)} style={[theme.typography.label, { color: theme.colors.primary }]}>★ {location.rating.toFixed(1)} · {location.review_count} {t('approved reviews', 'одобрени отзива')}</Text> : null}</View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Close location details', 'Затворете подробностите за мястото')} onPress={map.clearSelectedLocation} hitSlop={10}><Ionicons name="close" size={25} color={theme.colors.textMuted} /></Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
        {location.connectors.length ? <Detail icon="speedometer-outline" label={t('Charging power', 'Мощност на зареждане')} value={location.power_kw ? t(`Up to ${location.power_kw} kW`, `До ${location.power_kw} kW`) : t('Not listed', 'Няма данни')} /> : null}
        {location.connectors.length ? <Detail icon="git-branch-outline" label={t('Connectors', 'Конектори')} value={t(`${location.connectors.length} listed`, `${location.connectors.length} налични`)} /> : null}
        <Detail icon="navigate-outline" label={t('Distance', 'Разстояние')} value={distance === null ? t('Use locate me', 'Използвайте местоположението ми') : `${distance.toFixed(distance < 10 ? 1 : 0)} km`} />
        <Detail icon="time-outline" label={t('Opening hours', 'Работно време')} value={Object.keys(location.opening_hours || {}).length ? t('See weekly schedule', 'Вижте седмичния график') : t('Not listed', 'Няма данни')} />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>{location.categories.map((id) => { const item = getCategoryConfig(id); return <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: theme.radii.pill, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: theme.colors.primarySoft }}><Ionicons name={item.icon as any} size={14} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.primary, fontSize: 11 }]}>{t(item.label, item.labelBg)}</Text></View>; })}</View>
      {(locale === 'bg' ? location.description_bg || location.description : location.description) ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{locale === 'bg' ? location.description_bg || location.description : location.description}</Text> : null}

      {location.connectors.length ? <View style={{ gap: 7 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{t('Charging options', 'Опции за зареждане')}</Text>{location.connectors.map((connector) => <View key={connector.id} style={{ borderRadius: theme.radii.md, backgroundColor: theme.colors.surfaceMuted, padding: theme.spacing.sm, flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}><View><Text style={[theme.typography.label, { color: theme.colors.text }]}>{connector.connectionType || t('Connector', 'Конектор')}{connector.fastCharge ? t(' · Fast', ' · Бързо') : ''}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{connector.usageCost || t('Cost not listed', 'Няма данни за цената')}</Text></View><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{connector.powerKw ? `${connector.powerKw} kW` : '—'}</Text></View>)}</View> : null}

      {location.sustainability_features?.length ? <View style={{ gap: 7 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{t('Sustainability features', 'Характеристики за устойчивост')}</Text>{location.sustainability_features.map((feature, index) => <View key={`${feature.label}:${index}`} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}><Ionicons name={feature.verified ? 'checkmark-circle' : 'information-circle-outline'} size={17} color={theme.colors.primary} /><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{feature.label}</Text>{feature.value ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{feature.value}</Text> : null}</View></View>)}</View> : null}
      {location.credentials.length ? <View style={{ gap: 7 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{t('Verified credentials', 'Проверени удостоверения')}</Text>{location.credentials.map((credential) => <Pressable key={credential.id} accessibilityRole="link" onPress={() => void Linking.openURL(credential.evidenceUrl)} style={{ borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.sm, flexDirection: 'row', gap: 8 }}><Ionicons name="ribbon-outline" size={19} color={theme.colors.primary} /><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{credential.type}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{credential.issuer}</Text></View><Ionicons name="open-outline" size={17} color={theme.colors.textMuted} /></Pressable>)}</View> : null}

      {checkInMessage ? <View accessibilityLiveRegion="polite" style={{ padding: theme.spacing.sm, borderRadius: theme.radii.md, backgroundColor: checkInState === 'error' ? theme.colors.danger : theme.colors.primarySoft }}><Text style={[theme.typography.bodySmall, { color: checkInState === 'error' ? '#FFFFFF' : theme.colors.primary }]}>{checkInMessage}</Text></View> : null}
      <View style={{ gap: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t(`Open ${location.name} in maps`, `Отворете ${locationName} в карти`)} onPress={() => void navigate()} style={({ pressed }) => ({ minHeight: 50, borderRadius: theme.radii.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: theme.spacing.xs, backgroundColor: theme.colors.primary, opacity: pressed ? 0.84 : 1 })}><Ionicons name="navigate" size={19} color={theme.colors.accent} /><Text style={[theme.typography.label, { color: theme.colors.textInverse }]}>{t('Open in Maps', 'Отворете в карти')}</Text></Pressable>
        {!isEvent ? <View style={{ flexDirection: 'row', gap: 8 }}><Pressable accessibilityRole="button" disabled={checkInState === 'loading' || checkInState === 'done'} onPress={() => void checkIn()} style={{ minHeight: 48, flex: 1, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, opacity: checkInState === 'loading' ? 0.6 : 1 }}><Ionicons name={checkInState === 'done' ? 'checkmark-circle' : 'location-outline'} size={18} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{checkInState === 'loading' ? t('Recording…', 'Записване…') : checkInState === 'done' ? t('Checked in', 'Посещението е записано') : 'Check in'}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/map/review/[id]' as any, params: { id: location.id, name: locationName } })} style={{ minHeight: 48, flex: 1, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}><Ionicons name="star-outline" size={18} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.text }]}>{t('Review', 'Отзив')}</Text></Pressable></View> : null}
        {!isEvent ? <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/map/contribute' as any, params: { kind: 'correction', locationId: location.id, name: locationName } })} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{t('Suggest a correction', 'Предложете корекция')}</Text></Pressable> : null}
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm, gap: 3 }}><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11 }]}>{t('Source', 'Източник')}: {location.source || t('Green Compass curated catalogue', 'Подбран каталог на Green Compass')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11 }]}>{t('Licence', 'Лиценз')}: {location.licence || t('Source-specific listing licence', 'Лиценз според източника')}</Text></View>
    </ScrollView>
  </View>;
}
