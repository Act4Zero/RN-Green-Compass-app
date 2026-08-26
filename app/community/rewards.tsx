import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, Skeleton } from '@/components/ui';
import { usePoints } from '@/context/PointsContext';
import { COMMUNITY_REWARD_TIERS, getRewardProgress } from '@/features/community';
import { useAppTheme } from '@/theme';

export default function CommunityRewardsScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { pointBalance, isBalanceLoading, refreshBalance } = usePoints();
  useFocusEffect(useCallback(() => { void refreshBalance(); }, [refreshBalance]));
  const progress = getRewardProgress(pointBalance.total);

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow="Virtual rewards" title="Green points and achievements" description="Earn points through verified app activity, community participation, completed challenges, and approved contributions." action={<AppButton label="Back" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    {isBalanceLoading ? <Skeleton height={180} /> : <Card elevated style={{ gap: theme.spacing.md, marginBottom: theme.spacing.xl, backgroundColor: theme.colors.primarySoft }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>Current balance</Text><Text style={[theme.typography.display, { color: theme.colors.text }]}>{pointBalance.total.toLocaleString()} points</Text>{progress.next ? <><Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{progress.pointsToNext.toLocaleString()} points until {progress.next.name}</Text><View style={{ height: 10, backgroundColor: theme.colors.surfaceStrong, borderRadius: 5, overflow: 'hidden' }}><View style={{ height: '100%', width: `${Math.min(100, Math.round((pointBalance.total / progress.next.pointsRequired) * 100))}%`, backgroundColor: theme.colors.primary }} /></View></> : <Text style={[theme.typography.h3, { color: theme.colors.success }]}>All community tiers unlocked</Text>}</Card>}

    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>Community reward tiers</Text>
    <View style={{ gap: theme.spacing.md }}>{COMMUNITY_REWARD_TIERS.map((tier) => { const unlocked = pointBalance.total >= tier.pointsRequired; return <Card key={tier.id} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, opacity: unlocked ? 1 : 0.72 }}><View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: unlocked ? theme.colors.accentSoft : theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={unlocked ? tier.icon : 'lock-closed-outline'} size={25} color={unlocked ? theme.colors.primary : theme.colors.textMuted} /></View><View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{tier.name}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{tier.description}</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={[theme.typography.label, { color: unlocked ? theme.colors.success : theme.colors.textMuted }]}>{unlocked ? 'UNLOCKED' : `${tier.pointsRequired} PTS`}</Text></View></Card>; })}</View>

    <Card style={{ marginTop: theme.spacing.xl, gap: theme.spacing.md }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>Achievement paths</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>{['Plastic-Free Hero', 'Eco Commuter', 'Zero-Waste Champion', 'Power of We'].map((label) => <View key={label} style={{ borderRadius: theme.radii.pill, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: theme.colors.surfaceMuted }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{label}</Text></View>)}</View><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Badges are awarded from tracked habits, streaks, goals, challenges, and community events. Commercial discounts, donations, and partner redemption are intentionally deferred until verified partners and fraud controls exist.</Text><AppButton label="View earned badges" icon="ribbon-outline" onPress={() => router.push('/profile/badges' as any)} /></Card>
  </Content></ScrollView></Screen>;
}
