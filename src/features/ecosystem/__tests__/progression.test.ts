import type { PointEvent, PointSource } from '@/types/community/points';
import { buildLocalSnapshot, calculateGrowthUnits, ECOSYSTEM_COMPLETION_THRESHOLD, getEcosystemCompletion, getEcosystemProgress } from '../progression';
import { getEcosystemMaturity, getHabitatRegeneration, getNextEcosystemMilestone, getSpeciesGrowth } from '../progression';
import { ECOSYSTEM_BIOMES } from '../catalog';

function event(id: string, source: PointSource, day = '2026-08-26', referenceId = id): PointEvent {
  return { id, user_id: 'user-1', source, reference_id: referenceId, points: 999, created_at: `${day}T10:00:00.000Z` };
}

describe('living ecosystem progression', () => {
  it.each(ECOSYSTEM_BIOMES)('grows every newly unlocked species independently in $id', (biome) => {
    for (const species of biome.species) {
      expect(getSpeciesGrowth(species.unlockAt, species).stage).toBe('seed');
      const { duration } = getSpeciesGrowth(species.unlockAt, species);
      expect(getSpeciesGrowth(species.unlockAt + duration, species).stage).toBe('mature');
      expect(getSpeciesGrowth(600, species).stage).toBe('mature');
    }
    expect(getEcosystemMaturity(biome.id)).toBe(600);
    expect(getNextEcosystemMilestone(528, biome.id)).not.toBeNull();
    expect(getNextEcosystemMilestone(1320, biome.id)).toBeNull();
  });

  it('shows the nearest visible change including germination, visitors and new plants', () => {
    expect(getNextEcosystemMilestone(0)).toMatchObject({ at: 24, kind: 'growth', stage: 'sprout' });
    expect(getNextEcosystemMilestone(24)).toMatchObject({ at: 36, kind: 'guest' });
    expect(getNextEcosystemMilestone(72)).toMatchObject({ at: 96, kind: 'species' });
  });

  it.each([NaN, Infinity, -1])('handles invalid growth %s without broken progress bars or locked-species unlocks', (units) => {
    expect(getEcosystemProgress(units).growthUnits).toBe(0);
    expect(getEcosystemCompletion(units).progress).toBe(0);
  });
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

it('adds a bounded new generation after maturity and preserves earlier generations', () => {
  expect(getHabitatRegeneration(599)).toHaveLength(0);
  expect(getHabitatRegeneration(600)[0].stage).toBe('seed');
  expect(getHabitatRegeneration(624)[0].stage).toBe('sprout');
  expect(getHabitatRegeneration(840).map((plant) => plant.stage)).toEqual(['mature', 'seed']);
  expect(getHabitatRegeneration(1320).map((plant) => plant.stage)).toEqual(['mature', 'mature', 'mature']);
  expect(getHabitatRegeneration(100000)).toHaveLength(3);
});
