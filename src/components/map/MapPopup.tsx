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
import { formatAddress, getPlatformSpecificNavigationUrl } from '@/utils/mapUtils';

function Detail({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const { theme } = useAppTheme();
  return <View style={{ flex: 1, minWidth: 120, padding: theme.spacing.sm, borderRadius: theme.radii.md, backgroundColor: theme.colors.surfaceMuted, gap: 4 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ionicons name={icon} size={16} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.textMuted, fontSize: 11 }]}>{label}</Text></View><Text style={[theme.typography.label, { color: theme.colors.text }]}>{value}</Text></View>;
}

export default function MapPopup({ location }: { location: MapLocation }) {
  const map = useMapIntegration();
  const router = useRouter();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const [checkInState, setCheckInState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [checkInMessage, setCheckInMessage] = useState('');
  const desktop = width >= theme.breakpoints.desktop;
  const distance = distanceFromPoint(location, map.userLocation);
  const address = formatAddress(location);
  const category = getCategoryConfig(location.category);
  const isEvent = location.id.startsWith('event:');

  const navigate = async () => {
    const url = getPlatformSpecificNavigationUrl(location.lat, location.lng, location.name, address);
    analyticsService.trackEvent('map_navigation_opened', { location_id: location.id, platform: Platform.OS });
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  };

  const checkIn = async () => {
    setCheckInState('loading');
    try {
      const result = await sustainabilityMapService.checkIn(location.id);
      setCheckInState('done');
      setCheckInMessage(result.firstVisit ? `First visit recorded · +${result.pointsAwarded} Green Points` : 'Today’s visit was recorded.');
      analyticsService.trackEvent('map_checkin_completed', { location_id: location.id, first_visit: result.firstVisit });
    } catch (error) {
      setCheckInState('error');
      setCheckInMessage(error instanceof Error ? error.message : 'Check-in failed.');
    }
  };

  return <View style={[theme.shadows.raised, { position: 'absolute', zIndex: 70, backgroundColor: theme.colors.backgroundElevated, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden', ...(desktop ? { right: 20, top: 146, bottom: 54, width: 410, borderRadius: theme.radii.xl } : { left: 12, right: 12, bottom: 14, maxHeight: '68%', borderRadius: theme.radii.xl }) }]}>
    <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }}><Ionicons name={category.icon as any} size={23} color={theme.colors.accent} /></View>
        <View style={{ flex: 1, gap: 3 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Text accessibilityRole="header" style={[theme.typography.h3, { color: theme.colors.text, flexShrink: 1 }]}>{location.name}</Text>{location.verified ? <Ionicons accessibilityLabel="Verified location" name="shield-checkmark" size={18} color={theme.colors.primary} /> : null}</View><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{address || location.town || category.label}</Text>{location.rating ? <Text accessibilityLabel={`${location.rating} out of 5 from ${location.review_count} reviews`} style={[theme.typography.label, { color: theme.colors.primary }]}>★ {location.rating.toFixed(1)} · {location.review_count} approved reviews</Text> : null}</View>
        <Pressable accessibilityRole="button" accessibilityLabel="Close location details" onPress={map.clearSelectedLocation} hitSlop={10}><Ionicons name="close" size={25} color={theme.colors.textMuted} /></Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
        {location.connectors.length ? <Detail icon="speedometer-outline" label="Charging power" value={location.power_kw ? `Up to ${location.power_kw} kW` : 'Not listed'} /> : null}
        {location.connectors.length ? <Detail icon="git-branch-outline" label="Connectors" value={`${location.connectors.length} listed`} /> : null}
        <Detail icon="navigate-outline" label="Distance" value={distance === null ? 'Use locate me' : `${distance.toFixed(distance < 10 ? 1 : 0)} km`} />
        <Detail icon="time-outline" label="Opening hours" value={Object.keys(location.opening_hours || {}).length ? 'See weekly schedule' : 'Not listed'} />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>{location.categories.map((id) => { const item = getCategoryConfig(id); return <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: theme.radii.pill, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: theme.colors.primarySoft }}><Ionicons name={item.icon as any} size={14} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.primary, fontSize: 11 }]}>{item.label}</Text></View>; })}</View>
      {location.description ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{location.description}</Text> : null}

      {location.connectors.length ? <View style={{ gap: 7 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>Charging options</Text>{location.connectors.map((connector) => <View key={connector.id} style={{ borderRadius: theme.radii.md, backgroundColor: theme.colors.surfaceMuted, padding: theme.spacing.sm, flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}><View><Text style={[theme.typography.label, { color: theme.colors.text }]}>{connector.connectionType || 'Connector'}{connector.fastCharge ? ' · Fast' : ''}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{connector.usageCost || 'Cost not listed'}</Text></View><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{connector.powerKw ? `${connector.powerKw} kW` : '—'}</Text></View>)}</View> : null}

      {location.sustainability_features?.length ? <View style={{ gap: 7 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>Sustainability features</Text>{location.sustainability_features.map((feature, index) => <View key={`${feature.label}:${index}`} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}><Ionicons name={feature.verified ? 'checkmark-circle' : 'information-circle-outline'} size={17} color={theme.colors.primary} /><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{feature.label}</Text>{feature.value ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{feature.value}</Text> : null}</View></View>)}</View> : null}
      {location.credentials.length ? <View style={{ gap: 7 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>Verified credentials</Text>{location.credentials.map((credential) => <Pressable key={credential.id} accessibilityRole="link" onPress={() => void Linking.openURL(credential.evidenceUrl)} style={{ borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.sm, flexDirection: 'row', gap: 8 }}><Ionicons name="ribbon-outline" size={19} color={theme.colors.primary} /><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{credential.type}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{credential.issuer}</Text></View><Ionicons name="open-outline" size={17} color={theme.colors.textMuted} /></Pressable>)}</View> : null}

      {checkInMessage ? <View accessibilityLiveRegion="polite" style={{ padding: theme.spacing.sm, borderRadius: theme.radii.md, backgroundColor: checkInState === 'error' ? theme.colors.danger : theme.colors.primarySoft }}><Text style={[theme.typography.bodySmall, { color: checkInState === 'error' ? '#FFFFFF' : theme.colors.primary }]}>{checkInMessage}</Text></View> : null}
      <View style={{ gap: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Open ${location.name} in maps`} onPress={() => void navigate()} style={({ pressed }) => ({ minHeight: 50, borderRadius: theme.radii.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: theme.spacing.xs, backgroundColor: theme.colors.primary, opacity: pressed ? 0.84 : 1 })}><Ionicons name="navigate" size={19} color={theme.colors.accent} /><Text style={[theme.typography.label, { color: theme.colors.textInverse }]}>Open in Maps</Text></Pressable>
        {!isEvent ? <View style={{ flexDirection: 'row', gap: 8 }}><Pressable accessibilityRole="button" disabled={checkInState === 'loading' || checkInState === 'done'} onPress={() => void checkIn()} style={{ minHeight: 48, flex: 1, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, opacity: checkInState === 'loading' ? 0.6 : 1 }}><Ionicons name={checkInState === 'done' ? 'checkmark-circle' : 'location-outline'} size={18} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{checkInState === 'loading' ? 'Recording…' : checkInState === 'done' ? 'Checked in' : 'Check in'}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/map/review/[id]' as any, params: { id: location.id, name: location.name } })} style={{ minHeight: 48, flex: 1, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}><Ionicons name="star-outline" size={18} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.text }]}>Review</Text></Pressable></View> : null}
        {!isEvent ? <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/map/contribute' as any, params: { kind: 'correction', locationId: location.id, name: location.name } })} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>Suggest a correction</Text></Pressable> : null}
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm, gap: 3 }}><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11 }]}>Source: {location.source || 'Green Compass curated catalogue'}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11 }]}>Licence: {location.licence || 'Source-specific listing licence'}</Text></View>
    </ScrollView>
  </View>;
}
