import type { PointEvent, PointSource } from '@/types/community/points';
import { buildLocalSnapshot, calculateGrowthUnits, ECOSYSTEM_COMPLETION_THRESHOLD, getEcosystemCompletion, getEcosystemProgress } from '../progression';

function event(id: string, source: PointSource, day = '2026-08-26', referenceId = id): PointEvent {
  return { id, user_id: 'user-1', source, reference_id: referenceId, points: 999, created_at: `${day}T10:00:00.000Z` };
}

describe('living ecosystem progression', () => {
  it('does not convert daily login points into growth', () => {
    expect(calculateGrowthUnits([event('login', 'daily_login', '2026-08-26', '')])).toBe(0);
  });

  it('uses fixed growth rules instead of raw point values', () => {
    expect(calculateGrowthUnits([event('habit-1', 'habit_log')])).toBe(12);
  });

  it('deduplicates the same source reference', () => {
    expect(calculateGrowthUnits([event('a', 'habit_log', '2026-08-26', 'same-log'), event('b', 'habit_log', '2026-08-26', 'same-log')])).toBe(12);
  });

  it('caps repeatable activity per source and day', () => {
    const habits = Array.from({ length: 6 }, (_, index) => event(`habit-${index}`, 'habit_log'));
    expect(calculateGrowthUnits(habits)).toBe(48);
  });

  it('moves through five permanent stages', () => {
    expect(getEcosystemProgress(0).stage).toBe('seed');
    expect(getEcosystemProgress(24).stage).toBe('sprout');
    expect(getEcosystemProgress(72).stage).toBe('young');
    expect(getEcosystemProgress(144).stage).toBe('leafy');
    expect(getEcosystemProgress(240).stage).toBe('mature');
    expect(getEcosystemProgress(999).nextStageAt).toBeNull();
  });

  it('keeps ecosystem completion separate from the active plant stage', () => {
    expect(ECOSYSTEM_COMPLETION_THRESHOLD).toBe(528);
    expect(getEcosystemCompletion(240)).toMatchObject({ complete: false, remaining: 288 });
    expect(getEcosystemCompletion(528)).toMatchObject({ complete: true, progress: 1, remaining: 0 });
  });

  it('unlocks species and guests without removing earlier progress', () => {
    const events = Array.from({ length: 20 }, (_, index) => event(`habit-${index}`, 'habit_log', `2026-08-${String(1 + index).padStart(2, '0')}`));
    const snapshot = buildLocalSnapshot(events);
    expect(snapshot.stage).toBe('mature');
    expect(snapshot.unlockedSpecies.length).toBeGreaterThan(2);
    expect(snapshot.guests.length).toBeGreaterThan(2);
  });

  it.each(['forest_meadow', 'savanna', 'rainforest'] as const)('builds an independent %s catalog with shared growth', (biome) => {
    const snapshot = buildLocalSnapshot([], undefined, biome);
    expect(snapshot.biome).toBe(biome);
    expect(snapshot.activeSpecies.unlockAt).toBe(0);
    expect(snapshot.unlockedSpecies).toHaveLength(1);
    expect(getEcosystemCompletion(528, biome).complete).toBe(true);
  });
});
