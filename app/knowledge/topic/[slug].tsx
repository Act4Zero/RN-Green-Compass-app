import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function KnowledgeTopicRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <Redirect href={{ pathname: '/knowledge/search' as any, params: { topic: slug } }} />;
}
