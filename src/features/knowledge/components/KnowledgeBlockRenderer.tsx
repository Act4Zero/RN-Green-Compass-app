import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { AppButton, Card } from '@/components/ui';
import { useAppTheme } from '@/theme';
import type { KnowledgeBlock, KnowledgeSource } from '../types';

export function KnowledgeBlockRenderer({ blocks, sources, sourceContentId, easyRead = false }: { blocks: KnowledgeBlock[]; sources: KnowledgeSource[]; sourceContentId: string; easyRead?: boolean }) {
  const { theme } = useAppTheme();
  const router = useRouter();

  return (
    <View style={{ gap: 18 }}>
      {blocks.map((block) => {
        if (block.type === 'heading') return <Text key={block.id} accessibilityRole="header" style={[block.level === 2 ? theme.typography.h2 : theme.typography.h3, { color: theme.colors.text, marginTop: 12 }]}>{block.text}</Text>;
        if (block.type === 'paragraph') return <Text key={block.id} selectable style={[theme.typography.body, { color: theme.colors.text, fontSize: easyRead ? 19 : 16, lineHeight: easyRead ? 32 : 27, maxWidth: easyRead ? 680 : undefined }]}>{block.text}</Text>;
        if (block.type === 'list' || block.type === 'checklist') return <View key={block.id} style={{ gap: 10 }}>{block.items.map((item, index) => <View key={`${block.id}-${index}`} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}><Ionicons name={block.type === 'checklist' ? 'checkbox-outline' : 'ellipse'} size={block.type === 'checklist' ? 20 : 7} color={theme.colors.primary} style={{ marginTop: block.type === 'checklist' ? 2 : 9 }} /><Text style={[theme.typography.body, { color: theme.colors.text, flex: 1 }]}>{item}</Text></View>)}</View>;
        if (block.type === 'callout') {
          const color = block.tone === 'warning' ? theme.colors.warning : block.tone === 'success' ? theme.colors.success : theme.colors.info;
          return <Card key={block.id} style={{ borderLeftWidth: 5, borderLeftColor: color, backgroundColor: theme.colors.surfaceMuted }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{block.title}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 7 }]}>{block.text}</Text></Card>;
        }
        if (block.type === 'stat') return <View key={block.id} style={{ paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border }}><Text style={[theme.typography.metric, { color: theme.colors.primary }]}>{block.value}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 4 }]}>{block.label} <Text style={{ color: theme.colors.info }}>[{sourceNumber(sources, block.sourceId)}]</Text></Text></View>;
        if (block.type === 'quote') return <View key={block.id} style={{ borderLeftWidth: 3, borderLeftColor: theme.colors.accent, paddingLeft: 18 }}><Text style={[theme.typography.h3, { color: theme.colors.text, fontStyle: 'italic' }]}>“{block.text}”</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 8 }]}>{block.attribution} [{sourceNumber(sources, block.sourceId)}]</Text></View>;
        if (block.type === 'infographic') return <InfographicBlock key={block.id} block={block} sources={sources} />;
        if (block.type === 'video') return <VideoBlock key={block.id} block={block} />;
        if (block.type === 'download') return <Card key={block.id}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{block.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginVertical: 8 }]}>{block.description} • {block.sizeLabel}</Text>{block.uri ? <AppButton label="Open toolkit" icon="download-outline" onPress={() => void Linking.openURL(block.uri!)} /> : null}</Card>;
        if (block.type === 'action') return <Card key={block.id} elevated style={{ backgroundColor: theme.colors.primarySoft }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{block.title}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginVertical: 10 }]}>{block.text}</Text><AppButton label={block.action.label} icon="arrow-forward" onPress={() => router.push({ pathname: block.action.route as any, params: { category: 'category' in block.action ? block.action.category : undefined, query: 'query' in block.action ? block.action.query : undefined, sourceContentId } })} /></Card>;
        return null;
      })}
    </View>
  );
}

function InfographicBlock({ block, sources }: { block: Extract<KnowledgeBlock, { type: 'infographic' }>; sources: KnowledgeSource[] }) {
  const { theme } = useAppTheme();
  const max = Math.max(...block.dataPoints.map((point) => point.value), 1);
  return <View accessible accessibilityRole="summary" accessibilityLabel={block.textAlternative}><Card elevated style={{ padding: 22, backgroundColor: theme.colors.surfaceMuted }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}><Ionicons name="stats-chart-outline" size={21} color={theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{block.template.replace('-', ' ')}</Text><Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginTop: 2 }]}>{block.title}</Text></View></View>
    <Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 12 }]}>{block.description}</Text>
    <View style={{ gap: 14, marginTop: 20 }}>{block.dataPoints.map((point, index) => <View key={point.id} accessible accessibilityLabel={`${index + 1}. ${point.label}. ${point.displayValue}${point.unit ? ` ${point.unit}` : ''}. Source ${sourceNumber(sources, point.sourceId)}.`}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }}><Text style={[theme.typography.label, { color: '#FFFFFF' }]}>{index + 1}</Text></View><Text style={[theme.typography.body, { color: theme.colors.text, flex: 1 }]}>{point.label}</Text><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{point.displayValue}{point.unit ? ` ${point.unit}` : ''}</Text></View><View style={{ height: 7, marginLeft: 40, borderRadius: 4, backgroundColor: theme.colors.surfaceStrong, overflow: 'hidden' }}><View style={{ height: '100%', width: `${Math.max(12, (point.value / max) * 100)}%`, backgroundColor: index % 2 ? theme.colors.accent : theme.colors.primary }} /></View></View>)}</View>
    <View style={{ marginTop: 22, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{block.takeaways.join(' • ')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 7 }]}>{[...new Set(block.dataPoints.map((point) => sourceNumber(sources, point.sourceId)))].map((number) => `[${number}]`).join(' ')} Source-linked visual summary</Text></View>
  </Card></View>;
}

function VideoBlock({ block }: { block: Extract<KnowledgeBlock, { type: 'video' }> }) {
  const { theme } = useAppTheme();
  const [consented, setConsented] = useState(!block.consentRequired);
  const [showTranscript, setShowTranscript] = useState(false);
  return <Card>
    <Ionicons name="play-circle-outline" size={38} color={theme.colors.primary} />
    <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 10 }]}>{block.title}</Text>
    <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginVertical: 8 }]}>{block.captionsUrl ? 'Captions available' : 'Accessible transcript available'} • Approved external provider</Text>
    {!consented ? <View style={{ gap: 9 }}><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>The external provider receives network information only after you choose to continue.</Text><AppButton label="Allow external video" icon="shield-checkmark-outline" onPress={() => setConsented(true)} /></View> : <AppButton label="Open video" icon="open-outline" onPress={() => void Linking.openURL(block.url)} />}
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: showTranscript }} onPress={() => setShowTranscript((value) => !value)} style={{ marginTop: 12, minHeight: 42, justifyContent: 'center' }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{showTranscript ? 'Hide transcript' : 'Read transcript'}</Text></Pressable>
    {showTranscript ? <Text selectable style={[theme.typography.bodySmall, { color: theme.colors.text, lineHeight: 22, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>{block.transcript}</Text> : null}
  </Card>;
}

function sourceNumber(sources: KnowledgeSource[], sourceId: string) {
  const index = sources.findIndex((source) => source.id === sourceId);
  return index >= 0 ? index + 1 : '?';
}
