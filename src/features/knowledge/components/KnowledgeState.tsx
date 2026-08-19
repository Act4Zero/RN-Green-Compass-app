import React from 'react';
import { View } from 'react-native';
import { AppButton, Skeleton, StatePanel } from '@/components/ui';

export function KnowledgeLoading() {
  return <View style={{ gap: 14 }}><Skeleton height={44} width="55%" /><Skeleton height={120} /><View style={{ flexDirection: 'row', gap: 12 }}><Skeleton height={220} width="48%" /><Skeleton height={220} width="48%" /></View></View>;
}

export function KnowledgeError({ retry }: { retry: () => void }) {
  return <StatePanel icon="cloud-offline-outline" title="The Hub could not load" message="Check your connection and try again. Downloaded reading remains available." action={<AppButton label="Try again" onPress={retry} />} />;
}
