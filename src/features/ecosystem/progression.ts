import { FOREST_MEADOW_GUESTS, FOREST_MEADOW_SPECIES, STAGE_ORDER, STAGE_THRESHOLDS } from './catalog';
import type { PointEvent } from '@/types/community/points';
import type { EcosystemGrowthRule, EcosystemProgress, EcosystemSnapshot } from './types';

export const ECOSYSTEM_GROWTH_RULES: EcosystemGrowthRule[] = [
  { source: 'daily_login', units: 0, requiresReference: false },
  { source: 'habit_log', units: 12, requiresReference: true, dailyCap: 4 },
  { source: 'habit_streak', units: 8, requiresReference: true, dailyCap: 1 },
  { source: 'learning_milestone', units: 10, requiresReference: true, dailyCap: 3 },
  { source: 'daily_challenge', units: 16, requiresReference: true, dailyCap: 1 },
  { source: 'discussion_participation', units: 4, requiresReference: true, dailyCap: 2 },
];

const RULE_BY_SOURCE = Object.fromEntries(ECOSYSTEM_GROWTH_RULES.map((rule) => [rule.source, rule])) as Record<string, EcosystemGrowthRule>;

export const ECOSYSTEM_COMPLETION_THRESHOLD = Math.max(
  ...FOREST_MEADOW_SPECIES.map((species) => species.unlockAt),
  ...FOREST_MEADOW_GUESTS.map((guest) => guest.unlockAt),
);

export function getEcosystemCompletion(growthUnits: number) {
  const safeUnits = Math.max(0, Math.floor(growthUnits));
  const remaining = Math.max(0, ECOSYSTEM_COMPLETION_THRESHOLD - safeUnits);
  return {
    complete: remaining === 0,
    progress: Math.min(1, safeUnits / ECOSYSTEM_COMPLETION_THRESHOLD),
    remaining,
    threshold: ECOSYSTEM_COMPLETION_THRESHOLD,
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

export function buildLocalSnapshot(events: PointEvent[], activeSpeciesSlug = FOREST_MEADOW_SPECIES[0].slug): EcosystemSnapshot {
  const growthUnits = calculateGrowthUnits(events);
  const activeSpecies = FOREST_MEADOW_SPECIES.find((species) => species.slug === activeSpeciesSlug && species.unlockAt <= growthUnits) || FOREST_MEADOW_SPECIES[0];
  const guests = FOREST_MEADOW_GUESTS.filter((guest) => guest.unlockAt <= growthUnits);
  return {
    biome: 'forest_meadow',
    activeSpecies,
    unlockedSpecies: FOREST_MEADOW_SPECIES.filter((species) => species.unlockAt <= growthUnits),
    guests,
    nextGuest: FOREST_MEADOW_GUESTS.find((guest) => guest.unlockAt > growthUnits) || null,
    source: 'local',
    ...getEcosystemProgress(growthUnits),
  };
}
