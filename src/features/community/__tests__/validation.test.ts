import { COMMUNITY_REWARD_TIERS, getCountdownLabel, getRewardProgress, normalizeInviteCode, validateCommunitySubmission, validateExternalUrl } from '../validation';

describe('community engagement validation', () => {
  it('normalizes invite codes without accepting punctuation', () => {
    expect(normalizeInviteCode(' ab-12 cd!34 ')).toBe('AB12CD34');
    expect(normalizeInviteCode('abcdefghijklmnop')).toBe('ABCDEFGHIJKL');
  });

  it('accepts only secure external links', () => {
    expect(validateExternalUrl('https://example.org/event')).toBe('https://example.org/event');
    expect(() => validateExternalUrl('http://example.org')).toThrow(/HTTPS/);
    expect(() => validateExternalUrl('not a link')).toThrow(/valid HTTPS/);
  });

  it('requires sources for submitted articles and videos', () => {
    expect(() => validateCommunitySubmission({ type: 'article', title: 'Useful repair guide', body: 'A detailed and practical repair guide for the community.' })).toThrow(/require an HTTPS/);
    expect(validateCommunitySubmission({ type: 'tip', title: 'Carry a repair kit', body: 'A small repair kit can extend the useful life of everyday items.' }).url).toBeNull();
  });

  it('uses human countdown labels at event boundaries', () => {
    expect(getCountdownLabel('2026-09-02T12:00:00Z', new Date('2026-09-01T12:00:00Z'))).toBe('1 day left');
    expect(getCountdownLabel('2026-08-31T12:00:00Z', new Date('2026-09-01T12:00:00Z'))).toBe('Ended');
    expect(getCountdownLabel('2026-09-04T12:00:00Z', new Date('2026-09-01T12:00:00Z'), 'bg')).toBe('Остават 3 дни');
    expect(getCountdownLabel('2026-08-31T12:00:00Z', new Date('2026-09-01T12:00:00Z'), 'bg')).toBe('Приключило');
  });

  it('calculates virtual reward progress without overshooting', () => {
    const progress = getRewardProgress(500);
    expect(progress.unlocked.map((tier) => tier.id)).toEqual(['seedling', 'community-builder']);
    expect(progress.next).toEqual(COMMUNITY_REWARD_TIERS[2]);
    expect(progress.pointsToNext).toBe(1000);
  });
});
