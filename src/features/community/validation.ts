import type { CommunityRewardTier, CommunitySubmissionType } from './types';

export const COMMUNITY_REWARD_TIERS: CommunityRewardTier[] = [
  { id: 'seedling', name: 'Seedling', description: 'A digital milestone for starting your green practice.', pointsRequired: 100, icon: 'leaf-outline' },
  { id: 'community-builder', name: 'Community Builder', description: 'Recognizes consistent action and knowledge sharing.', pointsRequired: 500, icon: 'ribbon-outline' },
  { id: 'planet-ally', name: 'Planet Ally', description: 'Celebrates long-term community impact.', pointsRequired: 1500, icon: 'earth-outline' },
];

export function normalizeInviteCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
}

export function validateExternalUrl(value?: string | null): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:') throw new Error('Only secure HTTPS links are accepted.');
    return parsed.toString();
  } catch (error) {
    if (error instanceof Error && error.message === 'Only secure HTTPS links are accepted.') throw error;
    throw new Error('Enter a valid HTTPS link.');
  }
}

export function validateCommunitySubmission(input: { type: CommunitySubmissionType; title: string; body: string; url?: string | null }) {
  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < 5 || title.length > 120) throw new Error('Title must be between 5 and 120 characters.');
  if (body.length < 20 || body.length > 5000) throw new Error('Submission must be between 20 and 5,000 characters.');
  const url = validateExternalUrl(input.url);
  if (['article', 'video'].includes(input.type) && !url) throw new Error('Articles and videos require an HTTPS source link.');
  return { ...input, title, body, url };
}

export function getCountdownLabel(endsAt: string, now = new Date()): string {
  const remaining = new Date(endsAt).getTime() - now.getTime();
  if (remaining <= 0) return 'Ended';
  const days = Math.ceil(remaining / 86_400_000);
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export function getRewardProgress(points: number, tiers = COMMUNITY_REWARD_TIERS) {
  const unlocked = tiers.filter((tier) => points >= tier.pointsRequired);
  const next = tiers.find((tier) => points < tier.pointsRequired) || null;
  return {
    unlocked,
    next,
    pointsToNext: next ? Math.max(0, next.pointsRequired - points) : 0,
  };
}
