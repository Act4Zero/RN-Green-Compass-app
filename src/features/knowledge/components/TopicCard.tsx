import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAppTheme } from '@/theme';
import type { KnowledgeTopic } from '../types';

export function TopicCard({ topic }: { topic: KnowledgeTopic }) {
  const { theme } = useAppTheme();
  const router = useRouter();
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={`Explore ${topic.name}`} onPress={() => router.push(`/knowledge/topic/${topic.slug}` as any)} style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1, width: 220, minHeight: 154, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.lg, backgroundColor: theme.colors.surface, padding: theme.spacing.lg })}>
      <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: `${topic.accent}22` }}>
        <Ionicons name={topic.icon as any} size={22} color={topic.accent} />
      </View>
      <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 14 }]}>{topic.name}</Text>
      <Text numberOfLines={2} style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 5 }]}>{topic.description}</Text>
    </Pressable>
  );
}
