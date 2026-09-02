import React from 'react';
import { View } from 'react-native';
import { AppButton, Skeleton, StatePanel } from '@/components/ui';
import { useAppLocale } from '@/context/AppLocaleContext';

export function KnowledgeLoading() {
  return <View style={{ gap: 14 }}><Skeleton height={44} width="55%" /><Skeleton height={120} /><View style={{ flexDirection: 'row', gap: 12 }}><Skeleton height={220} width="48%" /><Skeleton height={220} width="48%" /></View></View>;
}

export function KnowledgeError({ retry }: { retry: () => void }) {
  const { t } = useAppLocale();
  return <StatePanel icon="cloud-offline-outline" title={t('The Hub could not load', 'Центърът за знания не можа да се зареди')} message={t('Check your connection and try again. Downloaded reading remains available.', 'Проверете връзката си и опитайте отново. Изтегленото съдържание остава достъпно.')} action={<AppButton label={t('Try again', 'Опитай отново')} onPress={retry} />} />;
}
