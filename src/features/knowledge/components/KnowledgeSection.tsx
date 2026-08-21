import React from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useAppTheme } from '@/theme';

export function KnowledgeSection({ title, description, children, horizontal = false }: { title: string; description?: string; children: React.ReactNode; horizontal?: boolean }) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const mobile = width < theme.breakpoints.tablet;
  return (
    <View style={{ marginBottom: theme.spacing.xl }}>
      <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text }]}>{title}</Text>
      {description ? <Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 5, marginBottom: 14 }]}>{description}</Text> : <View style={{ height: 14 }} />}
      {horizontal && mobile ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: theme.spacing.lg }}>{children}</ScrollView>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{children}</View>
      )}
    </View>
  );
}
