import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { AppButton, Content, Screen, StatePanel } from '@/components/ui';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export default function KnowledgePathScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const enabled = useFeatureFlag('knowledge_certificates', false);
  return <Screen><ScrollView><Content><StatePanel icon={enabled ? 'map-outline' : 'lock-closed-outline'} title={enabled ? 'Learning path is being prepared' : 'Structured paths are coming next'} message={enabled ? `The “${slug.replace(/-/g, ' ')}” path has not been published yet.` : 'The core Hub is live first. Reviewed learning paths and completion certificates will be enabled only after their assessments pass editorial review.'} action={<AppButton label="Browse current learning" onPress={() => router.replace('/knowledge' as any)} />} /></Content></ScrollView></Screen>;
}
