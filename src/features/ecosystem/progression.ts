import { getBiomeCatalog, STAGE_ORDER, STAGE_THRESHOLDS } from './catalog';
import type { PointEvent } from '@/types/community/points';
import type { EcosystemBiomeId, EcosystemGrowthRule, EcosystemProgress, EcosystemSnapshot } from './types';

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

export function getEcosystemCompletion(growthUnits: number, biome: EcosystemBiomeId = 'forest_meadow') {
  const catalog = getBiomeCatalog(biome);
  const threshold = Math.max(
    ...catalog.species.map((species) => species.unlockAt),
    ...catalog.guests.map((guest) => guest.unlockAt),
  );
  const safeUnits = Math.max(0, Math.floor(growthUnits));
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
  const safeUnits = Math.max(0, Math.floor(growthUnits));
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
  const growthUnits = calculateGrowthUnits(events);
  const catalog = getBiomeCatalog(biome);
  const activeSpecies = catalog.species.find((species) => species.slug === activeSpeciesSlug && species.unlockAt <= growthUnits) || catalog.species[0];
  const guests = catalog.guests.filter((guest) => guest.unlockAt <= growthUnits);
  return {
    biome,
    activeSpecies,
    unlockedSpecies: catalog.species.filter((species) => species.unlockAt <= growthUnits),
    guests,
    nextGuest: catalog.guests.find((guest) => guest.unlockAt > growthUnits) || null,
    source: 'local',
    ...getEcosystemProgress(growthUnits),
  };
}
