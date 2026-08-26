import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import { useAppTheme } from '@/theme';
import type { KnowledgeItemSummary } from '../types';
import { KNOWLEDGE_TOPICS } from '../data/catalog';
import { resolveKnowledgeVisual } from '../visuals';

const TYPE_LABELS: Record<KnowledgeItemSummary['type'], string> = {
  article: 'Article', guide: 'Guide', infographic: 'Infographic', video: 'Video', quiz: 'Quiz', resource: 'Resource', diy: 'DIY project', tour: 'Virtual tour', simulation: 'Impact lab', webinar: 'Live session', daily_fact: 'Eco fact', daily_quote: 'Leader quote', daily_tip: 'Daily tip',
};

export function KnowledgeCard({ item, reason, progress, compact = false }: { item: KnowledgeItemSummary; reason?: string; progress?: number; compact?: boolean }) {
  const { theme } = useAppTheme();
  const router = useRouter();
  const topic = item.topicSlugs[0]?.replace(/-/g, ' ') || 'Sustainability';
  const { source, visual } = resolveKnowledgeVisual(item, KNOWLEDGE_TOPICS);
  const href = item.type === 'quiz' ? `/knowledge/quiz/${item.id}` : item.type === 'tour' ? `/knowledge/tour/${item.id}` : item.type === 'simulation' ? `/knowledge/simulation/${item.id}` : item.type === 'webinar' ? `/knowledge/webinar/${item.id}` : `/knowledge/content/${item.slug}`;
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={`${item.title}, ${TYPE_LABELS[item.type]}`} onPress={() => router.push(href as any)} style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1, flex: compact ? undefined : 1, minWidth: compact ? 270 : 280 })}>
      <Card elevated style={{ minHeight: compact ? 260 : 330, height: '100%', padding: 0, overflow: 'hidden', backgroundColor: theme.mode === 'dark' ? visual.palette.darkSurface : visual.palette.surface }}>
        <Image source={source} accessibilityLabel={visual.alt[item.locale]} resizeMode="cover" style={{ width: '100%', height: compact ? 112 : 148 }} />
        <View style={{ padding: theme.spacing.lg, flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <Text style={[theme.typography.label, { color: visual.palette.primary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>{TYPE_LABELS[item.type]}</Text>
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
              <Ionicons name="arrow-forward" size={18} color={visual.palette.primary} />
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}
