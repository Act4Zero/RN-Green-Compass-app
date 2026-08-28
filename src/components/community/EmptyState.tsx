import React from 'react';
import { StatePanel } from '@/components/ui';
import { useAppLocale } from '@/context/AppLocaleContext';

function EmptyState() {
  const { t } = useAppLocale();
  return (
    <StatePanel icon="chatbubbles-outline" title={t('A fresh conversation', 'Начало на нов разговор')} message={t('No posts here yet. Share a useful idea or a small win with the community.', 'Все още няма публикации. Споделете полезна идея или малка победа с общността.')} />
  );
}

export default EmptyState;
