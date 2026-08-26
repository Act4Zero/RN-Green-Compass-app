import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { AppButton, Card, Content, Screen } from '@/components/ui';
import { useAppTheme } from '@/theme';

const categories = [
  ['sunny-outline', 'Renewable energy'], ['leaf-outline', 'Local & organic'],
  ['infinite-outline', 'Zero-waste'], ['flash-outline', 'EV charging'],
  ['refresh-circle-outline', 'Recycling'], ['trail-sign-outline', 'Green spaces'],
  ['people-outline', 'Community & events'],
] as const;

export default function MapPreview() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= theme.breakpoints.desktop;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Content wide style={{ gap: theme.spacing.xl }}>
          <View style={{ flexDirection: desktop ? 'row' : 'column', alignItems: desktop ? 'center' : 'stretch', gap: theme.spacing.xxl, paddingVertical: theme.spacing.xl }}>
            <View style={{ flex: desktop ? 1 : undefined, width: desktop ? undefined : '100%', gap: theme.spacing.md }}>
              <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 7, borderRadius: theme.radii.pill, backgroundColor: theme.colors.primarySoft }}>
                <Ionicons name="shield-checkmark-outline" size={17} color={theme.colors.primary} />
                <Text style={[theme.typography.label, { color: theme.colors.primary }]}>Verified sustainability directory</Text>
              </View>
              <Text accessibilityRole="header" style={[theme.typography.h1, { color: theme.colors.text, fontSize: desktop ? 48 : 34, lineHeight: desktop ? 56 : 41 }]}>Explore Bulgaria on a living 3D globe</Text>
              <Text style={[theme.typography.body, { color: theme.colors.textMuted, maxWidth: 620 }]}>Discover EV chargers and a growing catalogue of verified sustainable places, community initiatives and curated eco-routes. Sign in before the interactive map opens so Green Compass can keep map usage accountable and within its protected budget.</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                <AppButton label="Sign in to open the globe" icon="earth-outline" onPress={() => router.push({ pathname: '/auth/signin', params: { next: '/map' } })} />
                <AppButton label="Create free account" icon="person-add-outline" variant="secondary" onPress={() => router.push({ pathname: '/auth/signup', params: { next: '/map' } })} />
              </View>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>The preview does not load Mapbox and does not consume a paid map session.</Text>
            </View>
            <View style={[theme.shadows.raised, { flex: desktop ? 1 : undefined, flexShrink: 0, width: '100%', maxWidth: 650, aspectRatio: 1680 / 943, position: 'relative', borderRadius: theme.radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, backgroundColor: '#071C2C' }]}>
              <Image source={require('../../../docs/features/images/sustainability-globe-style-previews.png')} resizeMode="cover" accessibilityLabel="Preview of the Sustainability Globe in Living Earth, Night Canopy and Satellite styles" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%' }} />
              <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: theme.radii.lg, padding: 14, backgroundColor: 'rgba(7,28,44,0.88)' }}>
                <View><Text style={[theme.typography.label, { color: '#FFFFFF' }]}>57 physical EV places</Text><Text style={[theme.typography.bodySmall, { color: '#D7E6A8' }]}>89 licensed connector records</Text></View>
                <Ionicons name="lock-closed" size={22} color="#C6F177" />
              </View>
            </View>
          </View>

          <View style={{ gap: theme.spacing.md }}>
            <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text }]}>One map, seven verified discovery layers</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              {categories.map(([icon, label]) => <Card key={label} style={{ minWidth: desktop ? 220 : '47%', flexGrow: 1, flexBasis: desktop ? '22%' : '45%', flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.md }}><View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={icon} size={21} color={theme.colors.primary} /></View><Text style={[theme.typography.label, { color: theme.colors.text, flex: 1 }]}>{label}</Text></Card>)}
            </View>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>A category becomes available only after its first location is reviewed and published. Empty or unlicensed results are never presented as coverage.</Text>
          </View>

          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/auth/signin', params: { next: '/map' } })} style={{ minHeight: 64, borderRadius: theme.radii.xl, backgroundColor: theme.colors.primary, padding: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.textInverse }]}>Ready to explore?</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.accent }]}>Sign in to search, filter, check in and earn Green Points.</Text></View><Ionicons name="arrow-forward-circle" size={34} color={theme.colors.accent} />
          </Pressable>
        </Content>
      </ScrollView>
    </Screen>
  );
}
