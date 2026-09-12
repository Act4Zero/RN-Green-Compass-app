import { getBiomeCatalog, STAGE_ORDER, STAGE_THRESHOLDS } from './catalog';
import type { PointEvent } from '@/types/community/points';
import type { EcosystemBiomeId, EcosystemGrowthRule, EcosystemProgress, EcosystemSnapshot, EcosystemSpecies } from './types';

export const ECOSYSTEM_GROWTH_RULES: EcosystemGrowthRule[] = [
  { source: 'daily_login', units: 0, requiresReference: false },
  { source: 'habit_log', units: 12, requiresReference: true, dailyCap: 4 },
  { source: 'habit_streak', units: 8, requiresReference: true, dailyCap: 1 },
  { source: 'learning_milestone', units: 10, requiresReference: true, dailyCap: 3 },
  { source: 'daily_challenge', units: 16, requiresReference: true, dailyCap: 1 },
  { source: 'discussion_participation', units: 4, requiresReference: true, dailyCap: 2 },
];

const RULE_BY_SOURCE = Object.fromEntries(ECOSYSTEM_GROWTH_RULES.map((rule) => [rule.source, rule])) as Record<string, EcosystemGrowthRule>;

export const ECOSYSTEM_COMPLETION_THRESHOLD = 528;

export function normalizeGrowth(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

const TREE_SPECIES = new Set(['english-oak', 'small-leaved-lime', 'umbrella-thorn', 'african-baobab', 'marula', 'silver-cluster-leaf', 'kapok-tree', 'brazil-nut-tree', 'cacao-tree', 'rubber-tree', 'acai-palm']);
const WOODY_OR_CLIMBING_SPECIES = new Set(['cornelian-cherry', 'dog-rose', 'vanilla-orchid']);

// Unlocks remain compatible with earned rewards. Visual age belongs to the
// individual plant, so selecting another species cannot age or shrink the world.
export function getSpeciesGrowth(growthUnits: number, species: EcosystemSpecies) {
  const age = Math.max(0, normalizeGrowth(growthUnits) - species.unlockAt);
  // Relative game pacing by growth form, not a claim about real-world years.
  const duration = TREE_SPECIES.has(species.slug) ? 240 : WOODY_OR_CLIMBING_SPECIES.has(species.slug) ? 144 : 72;
  const progress = getEcosystemProgress(Math.floor(age * 240 / duration));
  return { ...progress, age, duration, maturity: Math.min(1, age / duration) };
}

export function getEcosystemMaturity(biome: EcosystemBiomeId = 'forest_meadow') {
  return Math.max(...getBiomeCatalog(biome).species.map((species) => species.unlockAt + getSpeciesGrowth(0, species).duration));
}

// A bounded second generation fills gaps behind the established plants without
// replacing them or turning an open savanna into an ever denser forest.
export function getHabitatRegeneration(growthUnits: number, biome: EcosystemBiomeId = 'forest_meadow') {
  const firstGeneration = getEcosystemMaturity(biome);
  const species = getBiomeCatalog(biome).species[0];
  return [0, 1, 2].map((index) => {
    const startsAt = firstGeneration + index * 240;
    const age = Math.max(0, normalizeGrowth(growthUnits) - startsAt);
    return { index, startsAt, species, ...getEcosystemProgress(age), maturity: Math.min(1, age / 240) };
  }).filter((plant) => growthUnits >= plant.startsAt);
}

export function getNextEcosystemMilestone(growthUnits: number, biome: EcosystemBiomeId = 'forest_meadow') {
  const catalog = getBiomeCatalog(biome);
  const units = normalizeGrowth(growthUnits);
  const milestones = [
    ...catalog.species.map((species) => ({ at: species.unlockAt, name: species.name, kind: 'species' as const })),
    ...catalog.guests.map((guest) => ({ at: guest.unlockAt, name: guest.name, kind: 'guest' as const })),
    ...catalog.species.flatMap((species) => {
      const duration = getSpeciesGrowth(units, species).duration;
      return STAGE_THRESHOLDS.slice(1).map((threshold, index) => ({
        at: species.unlockAt + Math.ceil(threshold / 240 * duration),
        name: species.name, kind: 'growth' as const, stage: STAGE_ORDER[index + 1],
      }));
    }),
    ...[0, 1, 2].flatMap((generation) => STAGE_THRESHOLDS.map((threshold, index) => ({
      at: getEcosystemMaturity(biome) + generation * 240 + threshold,
      name: { en: 'The next generation', bg: 'Ново поколение' },
      kind: 'growth' as const, stage: STAGE_ORDER[index],
    }))),
  ];
  return milestones.filter((milestone) => milestone.at > units).sort((a, b) => a.at - b.at)[0] || null;
}

export function getEcosystemCompletion(growthUnits: number, biome: EcosystemBiomeId = 'forest_meadow') {
  const catalog = getBiomeCatalog(biome);
  const threshold = Math.max(
    ...catalog.species.map((species) => species.unlockAt),
    ...catalog.guests.map((guest) => guest.unlockAt),
  );
  const safeUnits = normalizeGrowth(growthUnits);
  const remaining = Math.max(0, threshold - safeUnits);
  return {
    complete: remaining === 0,
    progress: Math.min(1, safeUnits / threshold),
    remaining,
    threshold,
  };
}

export function calculateGrowthUnits(events: PointEvent[]): number {
  const seen = new Set<string>();
  const dailyCounts = new Map<string, number>();

  return events.reduce((total, event) => {
    const rule = RULE_BY_SOURCE[event.source];
    if (!rule || rule.units <= 0 || (rule.requiresReference && !event.reference_id)) return total;

    const referenceKey = `${event.source}:${event.reference_id || event.id}`;
    if (seen.has(referenceKey)) return total;

    const day = event.created_at.slice(0, 10);
    const dailyKey = `${event.source}:${day}`;
    const currentCount = dailyCounts.get(dailyKey) || 0;
    if (rule.dailyCap && currentCount >= rule.dailyCap) return total;

    seen.add(referenceKey);
    dailyCounts.set(dailyKey, currentCount + 1);
    return total + rule.units;
  }, 0);
}

export function getEcosystemProgress(growthUnits: number): EcosystemProgress {
  const safeUnits = normalizeGrowth(growthUnits);
  let stageIndex = 0;
  STAGE_THRESHOLDS.forEach((threshold, index) => {
    if (safeUnits >= threshold) stageIndex = index;
  });

  const currentStageStart = STAGE_THRESHOLDS[stageIndex];
  const nextStageAt = STAGE_THRESHOLDS[stageIndex + 1] ?? null;
  const stageSpan = nextStageAt == null ? 1 : nextStageAt - currentStageStart;
  const stageProgress = nextStageAt == null ? 1 : Math.min(1, (safeUnits - currentStageStart) / stageSpan);

  return {
    growthUnits: safeUnits,
    stage: STAGE_ORDER[stageIndex],
    stageIndex,
    currentStageStart,
    nextStageAt,
    unitsToNextStage: nextStageAt == null ? 0 : Math.max(0, nextStageAt - safeUnits),
    stageProgress,
  };
}

export function buildLocalSnapshot(events: PointEvent[], activeSpeciesSlug?: string, biome: EcosystemBiomeId = 'forest_meadow'): EcosystemSnapshot {
  return buildSnapshotAtGrowth(calculateGrowthUnits(events), activeSpeciesSlug, biome);
}

export function buildSnapshotAtGrowth(units: number, activeSpeciesSlug?: string, biome: EcosystemBiomeId = 'forest_meadow', source: EcosystemSnapshot['source'] = 'local'): EcosystemSnapshot {
  const growthUnits = normalizeGrowth(units);
  const catalog = getBiomeCatalog(biome);
  const activeSpecies = catalog.species.find((species) => species.slug === activeSpeciesSlug && species.unlockAt <= growthUnits) || catalog.species[0];
  const guests = catalog.guests.filter((guest) => guest.unlockAt <= growthUnits);
  return {
    biome,
    activeSpecies,
    unlockedSpecies: catalog.species.filter((species) => species.unlockAt <= growthUnits),
    guests,
    nextGuest: catalog.guests.find((guest) => guest.unlockAt > growthUnits) || null,
    source,
    ...getEcosystemProgress(growthUnits),
  };
}
