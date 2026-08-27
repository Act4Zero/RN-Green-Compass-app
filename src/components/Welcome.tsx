import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import analyticsService from '../services/analyticsService';
import { AppButton, Card } from './ui';
import { useAppTheme } from '@/theme';

const BENEFITS = [
  { icon: 'analytics-outline' as const, title: 'See your real impact', text: 'Turn everyday choices into clear CO₂ savings, streaks, and progress.' },
  { icon: 'compass-outline' as const, title: 'Find greener places', text: 'Discover sustainable services and EV charging locations around you.' },
  { icon: 'people-outline' as const, title: 'Move together', text: 'Join practical challenges and learn from a community taking action.' },
];

export default function Welcome() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { theme, toggleTheme } = useAppTheme();
  const desktop = width >= 960;

  const navigate = (route: '/auth/signup' | '/auth/signin', event: string) => {
    analyticsService.trackEvent(event);
    router.push(route);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ minHeight: desktop ? 760 : undefined, flex: 1, paddingHorizontal: desktop ? 64 : 20, paddingVertical: 24 }}>
        <View style={{ width: '100%', maxWidth: 1320, alignSelf: 'center', flex: 1 }}>
          <View style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image source={require('../../assets/images/GCLogo-rich-premium-original-shape.png')} style={{ width: 42, height: 42 }} resizeMode="contain" />
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Green Compass</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${theme.mode === 'dark' ? 'light' : 'dark'} mode`}
              onPress={toggleTheme}
              style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
            >
              <Ionicons name={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={20} color={theme.colors.primary} />
            </Pressable>
          </View>

          <View style={{ flex: 1, flexDirection: desktop ? 'row' : 'column', alignItems: 'center', gap: desktop ? 70 : 38, paddingVertical: desktop ? 70 : 42 }}>
            <View style={{ flex: 1, width: '100%', maxWidth: 650 }}>
              <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: theme.colors.accentSoft, marginBottom: 22 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success }} />
                <Text style={[theme.typography.label, { color: theme.colors.primary }]}>A clearer path to everyday climate action</Text>
              </View>
              <Text style={[theme.typography.display, { color: theme.colors.text, fontSize: desktop ? 58 : 42, lineHeight: desktop ? 66 : 49, letterSpacing: -1.6 }]}>
                Small habits.{`\n`}Measurable change.
              </Text>
              <Text style={[theme.typography.body, { color: theme.colors.textMuted, fontSize: 18, lineHeight: 28, maxWidth: 570, marginTop: 22 }]}>Create a sustainability practice that fits real life. Green Compass helps you act, understand your impact, and keep moving forward.</Text>
              <View style={{ flexDirection: desktop ? 'row' : 'column', gap: 12, marginTop: 32, maxWidth: desktop ? 430 : undefined }}>
                <AppButton label="Start your journey" icon="arrow-forward" onPress={() => navigate('/auth/signup', 'welcome_signup_button_press')} style={{ flex: desktop ? 1 : undefined }} />
                <AppButton label="Sign in" variant="ghost" onPress={() => navigate('/auth/signin', 'welcome_login_button_press')} style={{ minWidth: 130 }} />
              </View>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 16 }]}>Free to begin · Private by design · Built for meaningful progress</Text>
            </View>

            <View style={{ flex: 1, width: '100%', maxWidth: 560 }}>
              <Card elevated style={{ padding: desktop ? 30 : 22, overflow: 'hidden' }}>
                <View style={{ position: 'absolute', right: -50, top: -70, width: 190, height: 190, borderRadius: 95, backgroundColor: theme.colors.accentSoft }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
                  <View>
                    <Text style={[theme.typography.label, { color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 }]}>This month</Text>
                    <Text style={[theme.typography.h2, { color: theme.colors.text, marginTop: 4 }]}>Your impact grows here</Text>
                  </View>
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="leaf" size={24} color={theme.colors.textInverse} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 26 }}>
                  {[
                    ['24', 'actions'],
                    ['18.6', 'kg CO₂'],
                    ['8', 'day streak'],
                  ].map(([value, label]) => (
                    <View key={label} style={{ flex: 1, padding: 14, borderRadius: theme.radii.md, backgroundColor: theme.colors.surfaceMuted }}>
                      <Text style={[theme.typography.metric, { color: theme.colors.primary, fontSize: 22 }]}>{value}</Text>
                      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11 }]}>{label}</Text>
                    </View>
                  ))}
                </View>
                <View style={{ gap: 18 }}>
                  {BENEFITS.map((benefit) => (
                    <View key={benefit.title} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                      <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={benefit.icon} size={20} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[theme.typography.h3, { color: theme.colors.text, fontSize: 15 }]}>{benefit.title}</Text>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 2 }]}>{benefit.text}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
