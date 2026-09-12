import React from 'react';
import { Image, type ImageSourcePropType, Text, useWindowDimensions, View } from 'react-native';
import { useAppTheme } from '@/theme';

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  illustration?: ImageSourcePropType;
  illustrationLabel?: string;
  emoji?: string;
  tone?: 'mint' | 'sun' | 'sky' | 'peach';
  children?: React.ReactNode;
};

export function SectionHero({ eyebrow, title, description, illustration, illustrationLabel, emoji, tone = 'mint', children }: Props) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const fill = theme.mode === 'dark' ? theme.colors.surfaceMuted : { mint: '#E2EFE5', sun: '#F2F4CD', sky: '#E5EFF4', peach: '#F7EBDE' }[tone];
  return <View style={{ borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, backgroundColor: fill, marginBottom: 24, flexDirection: compact ? 'column' : 'row' }}>
    <View style={{ flex: compact ? undefined : 1.5, padding: compact ? 22 : 30, justifyContent: 'center', gap: 10 }}>
      <Text style={[theme.typography.label, { color: theme.colors.primary, letterSpacing: 1.3, textTransform: 'uppercase', fontSize: 11 }]}>{eyebrow}</Text>
      <Text accessibilityRole="header" style={[theme.typography.h1, { color: theme.colors.text, fontSize: compact ? 28 : 36, lineHeight: compact ? 36 : 44 }]}>{title}{emoji ? ` ${emoji}` : ''}</Text>
      <Text style={[theme.typography.body, { color: theme.colors.textMuted, maxWidth: 600, fontSize: compact ? 14 : 16, lineHeight: compact ? 22 : 25 }]}>{description}</Text>
      {children ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>{children}</View> : null}
    </View>
    {illustration ? <Image source={illustration} resizeMode={compact ? 'contain' : 'cover'} accessibilityLabel={illustrationLabel} accessible={Boolean(illustrationLabel)} style={{ flex: compact ? undefined : 1, width: compact ? '100%' : undefined, height: compact ? 180 : undefined, minHeight: compact ? 180 : 230 }} /> : null}
  </View>;
}
