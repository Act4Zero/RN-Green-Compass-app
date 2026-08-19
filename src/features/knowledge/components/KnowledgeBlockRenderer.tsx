import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, Text, View } from 'react-native';
import { AppButton, Card } from '@/components/ui';
import { useAppTheme } from '@/theme';
import type { KnowledgeBlock, KnowledgeSource } from '../types';

export function KnowledgeBlockRenderer({ blocks, sources, sourceContentId }: { blocks: KnowledgeBlock[]; sources: KnowledgeSource[]; sourceContentId: string }) {
  const { theme } = useAppTheme();
  const router = useRouter();

  return (
    <View style={{ gap: 18 }}>
      {blocks.map((block) => {
        if (block.type === 'heading') return <Text key={block.id} accessibilityRole="header" style={[block.level === 2 ? theme.typography.h2 : theme.typography.h3, { color: theme.colors.text, marginTop: 12 }]}>{block.text}</Text>;
        if (block.type === 'paragraph') return <Text key={block.id} selectable style={[theme.typography.body, { color: theme.colors.text, lineHeight: 27 }]}>{block.text}</Text>;
        if (block.type === 'list' || block.type === 'checklist') return <View key={block.id} style={{ gap: 10 }}>{block.items.map((item, index) => <View key={`${block.id}-${index}`} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}><Ionicons name={block.type === 'checklist' ? 'checkbox-outline' : 'ellipse'} size={block.type === 'checklist' ? 20 : 7} color={theme.colors.primary} style={{ marginTop: block.type === 'checklist' ? 2 : 9 }} /><Text style={[theme.typography.body, { color: theme.colors.text, flex: 1 }]}>{item}</Text></View>)}</View>;
        if (block.type === 'callout') {
          const color = block.tone === 'warning' ? theme.colors.warning : block.tone === 'success' ? theme.colors.success : theme.colors.info;
          return <Card key={block.id} style={{ borderLeftWidth: 5, borderLeftColor: color, backgroundColor: theme.colors.surfaceMuted }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{block.title}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 7 }]}>{block.text}</Text></Card>;
        }
        if (block.type === 'stat') return <View key={block.id} style={{ paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border }}><Text style={[theme.typography.metric, { color: theme.colors.primary }]}>{block.value}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 4 }]}>{block.label} <Text style={{ color: theme.colors.info }}>[{sourceNumber(sources, block.sourceId)}]</Text></Text></View>;
        if (block.type === 'quote') return <View key={block.id} style={{ borderLeftWidth: 3, borderLeftColor: theme.colors.accent, paddingLeft: 18 }}><Text style={[theme.typography.h3, { color: theme.colors.text, fontStyle: 'italic' }]}>“{block.text}”</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 8 }]}>{block.attribution} [{sourceNumber(sources, block.sourceId)}]</Text></View>;
        if (block.type === 'video') return <Card key={block.id}><Ionicons name="play-circle-outline" size={34} color={theme.colors.primary} /><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 10 }]}>{block.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginVertical: 8 }]}>Transcript available • Approved external provider</Text><AppButton label="Open video" icon="open-outline" onPress={() => void Linking.openURL(block.url)} /></Card>;
        if (block.type === 'download') return <Card key={block.id}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{block.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginVertical: 8 }]}>{block.description} • {block.sizeLabel}</Text></Card>;
        if (block.type === 'action') return <Card key={block.id} elevated style={{ backgroundColor: theme.colors.primarySoft }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{block.title}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginVertical: 10 }]}>{block.text}</Text><AppButton label={block.action.label} icon="arrow-forward" onPress={() => router.push({ pathname: block.action.route as any, params: { category: 'category' in block.action ? block.action.category : undefined, query: 'query' in block.action ? block.action.query : undefined, sourceContentId } })} /></Card>;
        return null;
      })}
    </View>
  );
}

function sourceNumber(sources: KnowledgeSource[], sourceId: string) {
  const index = sources.findIndex((source) => source.id === sourceId);
  return index >= 0 ? index + 1 : '?';
}
