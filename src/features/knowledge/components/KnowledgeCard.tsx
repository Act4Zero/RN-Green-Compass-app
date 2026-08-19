import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import { useAppTheme } from '@/theme';
import type { KnowledgeItemSummary } from '../types';

const TYPE_LABELS: Record<KnowledgeItemSummary['type'], string> = {
  article: 'Article', guide: 'Guide', video: 'Video', quiz: 'Quiz', daily: 'Daily dose', resource: 'Resource',
};

export function KnowledgeCard({ item, reason, progress, compact = false }: { item: KnowledgeItemSummary; reason?: string; progress?: number; compact?: boolean }) {
  const { theme } = useAppTheme();
  const router = useRouter();
  const topic = item.topicSlugs[0]?.replace(/-/g, ' ') || 'Sustainability';
  const href = item.type === 'quiz' ? `/knowledge/quiz/${item.id}` : `/knowledge/content/${item.slug}`;
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={`${item.title}, ${TYPE_LABELS[item.type]}`} onPress={() => router.push(href as any)} style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1, flex: compact ? undefined : 1, minWidth: compact ? 270 : 280 })}>
      <Card elevated style={{ minHeight: compact ? 190 : 230, height: '100%', padding: 0, overflow: 'hidden' }}>
        <View style={{ height: compact ? 6 : 9, backgroundColor: item.type === 'quiz' ? theme.colors.accent : theme.colors.primary }} />
        <View style={{ padding: theme.spacing.lg, flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>{TYPE_LABELS[item.type]}</Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>• {item.estimatedMinutes} min</Text>
          </View>
          <Text numberOfLines={2} style={[theme.typography.h3, { color: theme.colors.text }]}>{item.title}</Text>
          <Text numberOfLines={compact ? 2 : 3} style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 8, flex: 1 }]}>{item.summary}</Text>
          {reason ? <Text numberOfLines={1} style={[theme.typography.label, { color: theme.colors.info, marginTop: 14 }]}>{reason}</Text> : null}
          {typeof progress === 'number' ? (
            <View style={{ marginTop: 14 }}>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: theme.colors.surfaceStrong, overflow: 'hidden' }}><View style={{ height: '100%', width: `${Math.max(0, Math.min(100, progress))}%`, backgroundColor: theme.colors.primary }} /></View>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 5 }]}>{progress}% complete</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <Text style={[theme.typography.label, { color: theme.colors.textMuted, textTransform: 'capitalize' }]}>{topic}</Text>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}
