import React from 'react';
import { StatePanel } from '@/components/ui';

function EmptyState() {
  return (
    <StatePanel icon="chatbubbles-outline" title="A fresh conversation" message="No posts here yet. Share a useful idea or a small win with the community." />
  );
}

export default EmptyState;
