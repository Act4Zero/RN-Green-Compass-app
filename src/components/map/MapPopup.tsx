import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import analyticsService from '../../services/analyticsService';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import { useAppTheme } from '../../theme';
import { MapLocation } from '../../types/map';
import { distanceFromPoint } from '../../utils/mapGlobe';
import { formatAddress, getPlatformSpecificNavigationUrl } from '../../utils/mapUtils';

function Detail({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ flex: 1, minWidth: 120, padding: theme.spacing.sm, borderRadius: theme.radii.md, backgroundColor: theme.colors.surfaceMuted, gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ionicons name={icon} size={16} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.textMuted, fontSize: 11 }]}>{label}</Text></View>
      <Text style={[theme.typography.label, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

export default function MapPopup({ location }: { location: MapLocation }) {
  const map = useMapIntegration();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= theme.breakpoints.desktop;
  const distance = distanceFromPoint(location, map.userLocation);
  const address = formatAddress(location);

  const navigate = async () => {
    const url = getPlatformSpecificNavigationUrl(location.lat, location.lng, location.name, address);
    analyticsService.trackEvent('map_navigation_opened', { location_id: location.id, platform: Platform.OS });
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  };

  return (
    <View style={[theme.shadows.raised, {
      position: 'absolute', zIndex: 70, backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden',
      ...(desktop
        ? { right: 20, top: 146, bottom: 54, width: 380, borderRadius: theme.radii.xl }
        : { left: 12, right: 12, bottom: 14, maxHeight: '58%', borderRadius: theme.radii.xl }),
    }]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }}><Ionicons name="flash" size={23} color={theme.colors.accent} /></View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text accessibilityRole="header" style={[theme.typography.h3, { color: theme.colors.text }]}>{location.name}</Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{address || location.town}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close location details" onPress={map.clearSelectedLocation} hitSlop={10}><Ionicons name="close" size={25} color={theme.colors.textMuted} /></Pressable>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
          <Detail icon="speedometer-outline" label="Charging power" value={location.power_kw ? `${location.power_kw} kW` : 'Not listed'} />
          <Detail icon="cash-outline" label="Usage cost" value={location.usage_cost || 'Not listed'} />
          <Detail icon="git-branch-outline" label="Connector" value={location.connection_type || 'Not listed'} />
          <Detail icon="navigate-outline" label="Distance" value={distance === null ? 'Use locate me' : `${distance.toFixed(distance < 10 ? 1 : 0)} km`} />
        </View>
        {location.is_fast_charge_capable ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.sm, paddingVertical: 8, alignSelf: 'flex-start', backgroundColor: theme.colors.accentSoft }}><Ionicons name="flash" size={16} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.primary }]}>Fast-charge capable</Text></View> : null}
        {location.description ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{location.description}</Text> : null}
        <Pressable
          accessibilityRole="button" accessibilityLabel={`Open ${location.name} in maps`}
          onPress={() => void navigate()}
          style={({ pressed }) => ({ minHeight: 50, borderRadius: theme.radii.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: theme.spacing.xs, backgroundColor: theme.colors.primary, opacity: pressed ? 0.84 : 1 })}
        >
          <Ionicons name="navigate" size={19} color={theme.colors.accent} />
          <Text style={[theme.typography.label, { color: theme.colors.textInverse }]}>Open in Maps</Text>
        </Pressable>
        <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm, gap: 3 }}>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11 }]}>Source: {location.source || 'Open Charge Map'}</Text>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11 }]}>Licence: {location.licence || 'Open Data Commons ODbL'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
