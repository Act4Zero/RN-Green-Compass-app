import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useAppTheme } from '@/theme';
import { formatBadgeForSharing } from '@/utils/sharing/badgeShareUtils';
import BadgeShareModal from './BadgeShareModal';

export const BADGE_CATEGORY_LABELS: Record<string, { en: string; bg: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  daily_flow: { en: 'Daily rhythm', bg: 'Дневен ритъм', icon: 'flame', color: '#F97316' },
  habit_tracker: { en: 'Green habits', bg: 'Зелени навици', icon: 'leaf', color: '#16A36A' },
  goals_challenges: { en: 'Challenges', bg: 'Предизвикателства', icon: 'flag', color: '#7C5CE5' },
  community: { en: 'Community', bg: 'Общност', icon: 'people', color: '#2389DA' },
  knowledge_hub: { en: 'Knowledge', bg: 'Знания', icon: 'school', color: '#D99A13' },
  meta: { en: 'Special', bg: 'Специални', icon: 'sparkles', color: '#D94F8A' },
};

interface BadgeItemProps {
  name: string;
  description: string | null;
  imageUrl?: string;
  isEarned: boolean;
  category: string;
  earnedDate?: string;
  userName?: string;
}

export default function BadgeItem({ name, description, imageUrl, isEarned, category, earnedDate, userName }: BadgeItemProps) {
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();
  const [hasImageError, setHasImageError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const categoryMeta = BADGE_CATEGORY_LABELS[category] || BADGE_CATEGORY_LABELS.meta;
  const categoryLabel = locale === 'bg' ? categoryMeta.bg : categoryMeta.en;
  const copy = description || '';
  const closeShare = useCallback(() => setShareOpen(false), []);

  return <>
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md,
      borderRadius: theme.radii.lg, borderWidth: 1,
      borderColor: isEarned ? `${categoryMeta.color}55` : theme.colors.border,
      backgroundColor: isEarned ? theme.colors.surface : theme.colors.surfaceMuted,
      opacity: isEarned ? 1 : 0.78,
    }}>
      <View style={{ width: 82, height: 82, borderRadius: 41, padding: 5, backgroundColor: `${categoryMeta.color}20`, borderWidth: 2, borderColor: isEarned ? categoryMeta.color : theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: isEarned ? `${categoryMeta.color}18` : theme.colors.background, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {imageUrl && !hasImageError
            ? <Image source={{ uri: imageUrl }} style={{ width: 54, height: 54, opacity: isEarned ? 1 : 0.45 }} resizeMode="contain" onError={() => setHasImageError(true)} />
            : <Ionicons name={isEarned ? categoryMeta.icon : 'lock-closed'} size={32} color={isEarned ? categoryMeta.color : theme.colors.textMuted} />}
        </View>
        {isEarned ? <View style={{ position: 'absolute', right: -2, bottom: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: categoryMeta.color, borderWidth: 3, borderColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="checkmark" size={14} color="#FFFFFF" /></View> : null}
      </View>

      <View style={{ flex: 1, gap: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Text style={[theme.typography.h3, { flex: 1, color: isEarned ? theme.colors.text : theme.colors.textMuted }]}>{name}</Text>
          {isEarned ? <Pressable accessibilityRole="button" accessibilityLabel={t(`Share ${name}`, `Сподели ${name}`)} onPress={() => setShareOpen(true)} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: `${categoryMeta.color}16`, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="share-social-outline" size={19} color={categoryMeta.color} /></Pressable> : null}
        </View>
        {copy ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]} numberOfLines={3}>{copy}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: theme.radii.pill, backgroundColor: `${categoryMeta.color}16` }}>
            <Ionicons name={categoryMeta.icon} size={13} color={categoryMeta.color} />
            <Text style={[theme.typography.label, { color: categoryMeta.color }]}>{categoryLabel}</Text>
          </View>
          <Text style={[theme.typography.label, { color: isEarned ? theme.colors.success : theme.colors.textMuted }]}>{isEarned ? t('Earned', 'Спечелена') : t('Locked', 'Заключена')}</Text>
        </View>
      </View>
    </View>

    {isEarned ? <BadgeShareModal isVisible={shareOpen} onClose={closeShare} onError={(error) => console.error('Error sharing badge:', error)} badgeData={{ name, description: copy, category, isEarned, earnedDate, imageUrl }} shareContent={formatBadgeForSharing(name, copy, category, earnedDate, userName)} userName={userName} /> : null}
  </>;
}
