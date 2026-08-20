import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useAppTheme } from '@/theme';
import type { KnowledgeTopic } from '../types';
import { KNOWLEDGE_ILLUSTRATIONS } from '../visuals';
import { localizedTopic, useKnowledgeLocale } from '../locale';

export function TopicCard({ topic }: { topic: KnowledgeTopic }) {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { locale } = useKnowledgeLocale();
  const copy = localizedTopic(topic, locale);
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={`${locale === 'bg' ? 'Разгледай' : 'Explore'} ${copy.name}`} onPress={() => router.push(`/knowledge/topic/${topic.slug}` as any)} style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1, width: 264, minHeight: 224, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.xl, backgroundColor: theme.mode === 'dark' ? topic.visual.palette.darkSurface : topic.visual.palette.surface, overflow: 'hidden' })}>
      <Image source={KNOWLEDGE_ILLUSTRATIONS[topic.visual.illustrationKey]} accessibilityLabel={topic.visual.alt[locale]} resizeMode="cover" style={{ width: '100%', height: 126 }} />
      <View style={{ padding: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><Ionicons name={topic.icon as any} size={20} color={topic.visual.palette.primary} /><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{copy.name}</Text></View>
        <Text numberOfLines={2} style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 6 }]}>{copy.description}</Text>
      </View>
    </Pressable>
  );
}
