import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import { useAppTheme } from '@/theme';
import type { CarbonBalanceSummary } from '@/features/offsetting/types';

export function ActionCard({ title, description, icon, onPress }: { title: string; description: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  const { theme } = useAppTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => ({ flex: 1, minWidth: 220, opacity: pressed ? 0.82 : 1 })}>
      <Card style={{ flex: 1, gap: theme.spacing.sm }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}>
          <Ionicons name={icon} size={22} color={theme.colors.primary} />
        </View>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{description}</Text>
      </Card>
    </Pressable>
  );
}

export function MetricCard({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  const { theme } = useAppTheme();
  return (
    <Card style={{ flex: 1, minWidth: 160 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.metric, { color: theme.colors.text, fontSize: 23 }]}>{value}</Text>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{label}</Text>
        </View>
        <Ionicons name={icon} size={22} color={theme.colors.primary} />
      </View>
    </Card>
  );
}

export function CarbonBalanceCards({ summary }: { summary: CarbonBalanceSummary }) {
  const { theme } = useAppTheme();
  return <View accessibilityLabel="Carbon balance summary" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
    <MetricCard label="Gross tracked" value={`${summary.grossTrackedKgCo2e.toFixed(1)} kg`} icon="analytics-outline" />
    <MetricCard label="Estimated avoided" value={`${summary.avoidedKgCo2e.toFixed(1)} kg`} icon="leaf-outline" />
    <MetricCard label="Retired offsets" value={`${summary.retiredOffsetKgCo2e.toFixed(1)} kg`} icon="shield-checkmark-outline" />
    <MetricCard label="Remaining balance" value={`${summary.netBalanceKgCo2e.toFixed(1)} kg`} icon="scale-outline" />
  </View>;
}

export function ChoiceChips<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text style={[theme.typography.label, { color: theme.colors.text }]}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onChange(option.value)} style={{ minHeight: 42, justifyContent: 'center', borderRadius: theme.radii.pill, borderWidth: 1, borderColor: selected ? theme.colors.primary : theme.colors.borderStrong, backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface, paddingHorizontal: theme.spacing.md }}>
              <Text style={[theme.typography.label, { color: selected ? theme.colors.primary : theme.colors.text }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function ImpactBars({ points }: { points: { date: string; co2eKgAvoided: number; actions: number }[] }) {
  const { theme } = useAppTheme();
  const visible = points.slice(-7);
  const max = Math.max(1, ...visible.map((point) => point.co2eKgAvoided));
  if (!visible.length) return <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Log an action or travel choice to start your chart.</Text>;
  return (
    <View accessibilityLabel="Seven day avoided emissions chart" style={{ flexDirection: 'row', alignItems: 'flex-end', height: 150, gap: theme.spacing.xs }}>
      {visible.map((point) => (
        <View key={point.date} style={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11 }]}>{point.co2eKgAvoided.toFixed(1)}</Text>
          <View style={{ width: '70%', minHeight: 4, height: `${Math.max(4, (point.co2eKgAvoided / max) * 90)}%`, backgroundColor: theme.colors.primary, borderRadius: theme.radii.sm }} />
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11 }]}>{point.date.slice(5)}</Text>
        </View>
      ))}
    </View>
  );
}

export function titleForTier(tier: string) {
  if (tier === 'impact_leader') return 'Impact Leader';
  if (tier === 'green_builder') return 'Green Builder';
  return 'Eco Explorer';
}
