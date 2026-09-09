import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useAppTheme } from '@/theme';
import { Card } from '@/components/ui';

const SOURCES = [
  { icon: 'leaf-outline' as const, en: 'Log a sustainable habit', bg: 'Запиши устойчив навик', pointsEn: '+1 point', pointsBg: '+1 точка', growthEn: '+12 growth', growthBg: '+12 растеж', limitEn: 'up to 4 a day', limitBg: 'до 4 на ден' },
  { icon: 'flame-outline' as const, en: 'Keep your habit streak', bg: 'Запази серията си', pointsEn: '+5 points', pointsBg: '+5 точки', growthEn: '+8 growth', growthBg: '+8 растеж', limitEn: 'once a day', limitBg: 'веднъж на ден' },
  { icon: 'school-outline' as const, en: 'Complete a learning milestone', bg: 'Завърши учебен етап', pointsEn: '+5–60 points', pointsBg: '+5–60 точки', growthEn: '+10 growth', growthBg: '+10 растеж', limitEn: 'up to 3 a day', limitBg: 'до 3 на ден' },
  { icon: 'sparkles-outline' as const, en: 'Complete the daily eco-challenge', bg: 'Завърши дневното еко предизвикателство', pointsEn: '+5 points', pointsBg: '+5 точки', growthEn: '+16 growth', growthBg: '+16 растеж', limitEn: 'once a day', limitBg: 'веднъж на ден' },
  { icon: 'chatbubbles-outline' as const, en: 'Take part in the community', bg: 'Участвай в общността', pointsEn: '+1 / +5 / +10 points', pointsBg: '+1 / +5 / +10 точки', growthEn: '+4 growth', growthBg: '+4 растеж', limitEn: 'up to 2 a day', limitBg: 'до 2 на ден' },
];

export function PointsGuide({ compact = false }: { compact?: boolean }) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const { locale, t } = useAppLocale();
  const columns = !compact && width >= 900;

  return (
    <Card style={{ padding: compact ? 18 : 22, gap: 16, backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong }}>
      <View style={{ flexDirection: columns ? 'row' : 'column', alignItems: columns ? 'center' : 'flex-start', gap: 14 }}>
        <View style={{ width: 48, height: 48, borderRadius: 17, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="compass-outline" size={24} color={theme.colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text }]}>{t('How progress is earned', 'Как се трупа напредък')}</Text>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 5 }]}>{t('Green points unlock reward tiers and rankings. Growth develops your plant and unlocks life in the ecosystem. The same verified action can add to both, but the values are intentionally different.', 'Зелените точки отключват нива и участват в класациите. Растежът развива растението и отключва живот в екосистемата. Едно проверено действие може да носи и от двете, но стойностите нарочно са различни.')}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Legend icon="star" label={t('Green points', 'Зелени точки')} color={theme.colors.warning} />
          <Legend icon="leaf" label={t('Ecosystem growth', 'Растеж')} color={theme.colors.primary} />
        </View>
      </View>

      <View style={{ flexDirection: columns ? 'row' : 'column', flexWrap: columns ? 'wrap' : 'nowrap', gap: 9 }}>
        {SOURCES.map((source) => (
          <View key={source.en} style={{ width: columns ? '49%' : '100%', minHeight: 72, padding: 12, borderRadius: theme.radii.md, backgroundColor: theme.colors.surfaceMuted, flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={source.icon} size={19} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.label, { color: theme.colors.text }]}>{locale === 'bg' ? source.bg : source.en}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{locale === 'bg' ? source.limitBg : source.limitEn}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 3 }}>
              <Text style={[theme.typography.label, { color: theme.colors.warning, fontSize: 11 }]}>{locale === 'bg' ? source.pointsBg : source.pointsEn}</Text>
              <Text style={[theme.typography.label, { color: theme.colors.primary, fontSize: 11 }]}>{locale === 'bg' ? source.growthBg : source.growthEn}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ padding: 12, borderRadius: theme.radii.md, backgroundColor: theme.colors.accentSoft, flexDirection: 'row', alignItems: 'flex-start', gap: 9 }}>
        <Ionicons name="information-circle-outline" size={19} color={theme.colors.primary} />
        <Text style={[theme.typography.bodySmall, { color: theme.colors.text, flex: 1 }]}>{t('Daily sign-in awards 20–45 green points depending on your streak, but does not grow the ecosystem. Community rewards are +1 for a comment, +5 for a post, and +10 for an approved contribution.', 'Ежедневният вход носи 20–45 зелени точки според серията, но не развива екосистемата. В общността получаваш +1 за коментар, +5 за публикация и +10 за одобрен материал.')}</Text>
      </View>
    </Card>
  );
}

function Legend({ icon, label, color }: { icon: 'star' | 'leaf'; label: string; color: string }) {
  const { theme } = useAppTheme();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: theme.radii.pill, backgroundColor: theme.colors.surfaceMuted }}><Ionicons name={icon} size={14} color={color} /><Text style={[theme.typography.label, { color: theme.colors.text, fontSize: 10 }]}>{label}</Text></View>;
}
