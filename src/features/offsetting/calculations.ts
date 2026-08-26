import { ACTIVITY_FACTORS, DAILY_CHALLENGES, DAILY_POLLS, FOOTPRINT_BENCHMARKS, IMPACT_EQUIVALENCIES, INTEREST_CATEGORY_MAP, TRAVEL_FACTORS, UK_ELECTRICITY_KG_CO2E_PER_KWH } from './catalog';
import type {
  CarbonActivityEntry,
  CarbonActivityInput,
  CarbonBalanceSummary,
  CarbonGoalDefinition,
  CarbonGoalProgress,
  DailyEcoChallenge,
  GreenIdentityAnswers,
  GreenIdentityResult,
  ImpactCategory,
  ImpactMetrics,
  ImpactSummary,
  LearningStage,
  SustainabilityPoll,
  TravelEstimate,
  TravelEstimateInput,
} from './types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number, precision = 1) => Number(value.toFixed(precision));

export function deriveLearningStage(completedActions: number): LearningStage {
  if (completedActions >= 50) return 'advanced';
  if (completedActions >= 10) return 'intermediate';
  return 'beginner';
}

export function calculateGreenIdentity(answers: GreenIdentityAnswers, completedAt = new Date().toISOString()): GreenIdentityResult {
  const distance = clamp(Number(answers.weeklyDistanceKm) || 0, 0, 3000);
  const occupancy = Math.max(1, Number(answers.householdSize) || 1);
  const travelFactor = TRAVEL_FACTORS[answers.primaryTravelMode].kgCo2ePerPassengerKm;
  const groundTravel = distance * 52 * (answers.primaryTravelMode === 'car' ? travelFactor / Math.min(occupancy, 5) : travelFactor);
  const flights = clamp(Number(answers.flightsPerYear) || 0, 0, 100) * 1500 * TRAVEL_FACTORS.plane.kgCo2ePerPassengerKm;
  const mobilityFootprint = groundTravel + flights;

  const monthlyKwh = clamp(Number(answers.householdEnergyKwhMonth) || 0, 0, 10000);
  const renewableShare = clamp(Number(answers.renewableEnergyPercent) || 0, 0, 100) / 100;
  const householdSize = clamp(Number(answers.householdSize) || 1, 1, 20);
  const energyFootprint = monthlyKwh * 12 * UK_ELECTRICITY_KG_CO2E_PER_KWH * (1 - renewableShare) / householdSize;

  const mobilityScore = clamp(100 - mobilityFootprint / 35, 0, 100);
  const foodScore = { meat_most_days: 25, meat_some_days: 55, vegetarian: 80, vegan: 95 }[answers.diet];
  const foodFootprint = { meat_most_days: 2500, meat_some_days: 1700, vegetarian: 1100, vegan: 800 }[answers.diet];
  const reuseScore = { rarely: 25, sometimes: 60, often: 90 }[answers.reuseFrequency];
  const recyclingScore = { rarely: 20, sometimes: 60, often: 90 }[answers.recyclingFrequency];
  const circularityScore = (reuseScore + recyclingScore) / 2;
  const shoppingLevel = answers.shoppingLevel || 'average';
  const consumptionFootprint = { low: 500, average: 1000, high: 1800 }[shoppingLevel];
  const consumptionScore = { low: 85, average: 55, high: 25 }[shoppingLevel];
  const wasteFrequency = answers.foodWasteFrequency || 'sometimes';
  const wasteFootprint = { rarely: 120, sometimes: 260, often: 480 }[wasteFrequency] * ({ rarely: 1, sometimes: 0.8, often: 0.6 }[answers.recyclingFrequency]);
  const wasteScore = { rarely: 90, sometimes: 60, often: 25 }[wasteFrequency];
  const heatingKwh = clamp(Number(answers.heatingEnergyKwhMonth) || 0, 0, 15000);
  const heatingFactor = answers.heatingType === 'natural_gas' ? 0.20269 : answers.heatingType === 'heating_oil' ? 0.29877 : answers.heatingType === 'electricity' ? UK_ELECTRICITY_KG_CO2E_PER_KWH : answers.heatingType === 'district' ? 0.17 : 0;
  const heatingFootprint = heatingKwh * 12 * heatingFactor / householdSize;
  const totalEnergyFootprint = energyFootprint + heatingFootprint;
  const totalEnergyScore = clamp(100 - totalEnergyFootprint / 15, 0, 100);
  const identityScore = Math.round(mobilityScore * 0.25 + totalEnergyScore * 0.25 + foodScore * 0.2 + consumptionScore * 0.15 + wasteScore * 0.1 + circularityScore * 0.05);
  const identityTier = identityScore >= 70 ? 'impact_leader' : identityScore >= 40 ? 'green_builder' : 'eco_explorer';
  const isPartial = !answers.countryCode || !answers.heatingType || answers.heatingEnergyKwhMonth === undefined || !answers.shoppingLevel || !answers.foodWasteFrequency;

  return {
    assessmentVersion: '2026.2',
    identityScore,
    identityTier,
    annualBaselineKgCo2e: round(mobilityFootprint + totalEnergyFootprint + foodFootprint + consumptionFootprint + wasteFootprint),
    categoryScores: { mobility: Math.round(mobilityScore), energy: Math.round(totalEnergyScore), food: foodScore, consumption: consumptionScore, waste: wasteScore, circularity: Math.round(circularityScore) },
    categoryFootprintKgCo2e: { mobility: round(mobilityFootprint), energy: round(totalEnergyFootprint), food: foodFootprint, consumption: consumptionFootprint, waste: round(wasteFootprint) },
    countryCode: answers.countryCode || 'GLOBAL',
    factorVersions: ['DESNZ-2026-JULY-v1', 'GC-FOOD-2026-v1', 'GC-CONSUMPTION-2026-v1', 'GC-WASTE-2026-v1'],
    isPartial,
    answers,
    completedAt,
  };
}

export function calculateCarbonActivity(input: CarbonActivityInput, id?: string): CarbonActivityEntry {
  const quantity = Number(input.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Quantity must be greater than zero.');
  const factor = ACTIVITY_FACTORS.find((candidate) => candidate.code === input.factorCode);
  if (!factor) throw new Error('Unknown emission factor.');
  const comparison = input.comparisonFactorCode ? ACTIVITY_FACTORS.find((candidate) => candidate.code === input.comparisonFactorCode) : null;
  if (input.comparisonFactorCode && !comparison) throw new Error('Unknown comparison factor.');
  if (comparison && comparison.unit !== factor.unit) throw new Error('Comparison factors must use the same unit.');
  const grossKgCo2e = round(quantity * factor.kgCo2ePerUnit, 3);
  const comparisonKgCo2e = comparison ? round(quantity * comparison.kgCo2ePerUnit, 3) : null;
  return {
    id,
    factorCode: factor.code,
    factorVersion: factor.version,
    category: factor.activity,
    label: factor.label,
    quantity: round(quantity, 3),
    unit: factor.unit,
    grossKgCo2e,
    comparisonKgCo2e,
    avoidedKgCo2e: comparisonKgCo2e === null ? 0 : round(Math.max(0, comparisonKgCo2e - grossKgCo2e), 3),
    occurredOn: input.occurredOn,
    notes: (input.notes || '').trim().slice(0, 500),
    sourceEventId: input.sourceEventId || null,
  };
}

export function calculateCarbonGoalProgress(goal: CarbonGoalDefinition & { id: string }, entries: CarbonActivityEntry[], now = new Date()): CarbonGoalProgress {
  const relevant = entries.filter((entry) => entry.category === goal.category && entry.occurredOn >= goal.startsOn && entry.occurredOn <= goal.endsOn);
  const gross = relevant.reduce((sum, entry) => sum + entry.grossKgCo2e, 0);
  const avoided = relevant.reduce((sum, entry) => sum + entry.avoidedKgCo2e, 0);
  let currentValue = relevant.length;
  if (goal.goalType === 'frequency') currentValue = new Set(relevant.map((entry) => entry.occurredOn)).size;
  if (goal.goalType === 'kg_co2e' || goal.goalType === 'absolute_reduction') currentValue = avoided;
  if (goal.goalType === 'percent_reduction') currentValue = goal.baselineValue && goal.baselineValue > 0 ? Math.max(0, ((goal.baselineValue - gross) / goal.baselineValue) * 100) : 0;
  currentValue = round(currentValue, 2);
  const percentComplete = round(clamp((currentValue / goal.targetValue) * 100, 0, 100), 1);
  const today = now.toISOString().slice(0, 10);
  const status = percentComplete >= 100 ? 'completed' : today > goal.endsOn ? 'expired' : 'active';
  return { ...goal, currentValue, percentComplete, status };
}

export function getProgressLevel(totalPoints: number): 'Carbon Cutter' | 'Eco Advocate' | 'Sustainability Champion' {
  if (totalPoints >= 1000) return 'Sustainability Champion';
  if (totalPoints >= 250) return 'Eco Advocate';
  return 'Carbon Cutter';
}

export function createCarbonBalance({ period, activities, retiredOffsetKgCo2e, impact, countryCode = 'GLOBAL' }: { period: ImpactSummary['period']; activities: CarbonActivityEntry[]; retiredOffsetKgCo2e: number; impact: ImpactSummary; countryCode?: string }): CarbonBalanceSummary {
  const grossTrackedKgCo2e = round(activities.reduce((sum, entry) => sum + entry.grossKgCo2e, 0), 2);
  const activityAvoided = round(activities.reduce((sum, entry) => sum + entry.avoidedKgCo2e, 0), 2);
  const avoidedKgCo2e = round(impact.metrics.co2eKgAvoided + activityAvoided, 2);
  const retired = round(Math.max(0, retiredOffsetKgCo2e), 2);
  const dates = new Set([...impact.series.map((point) => point.date), ...activities.map((entry) => entry.occurredOn)]);
  const series = Array.from(dates).sort().map((date) => ({
    date,
    actions: (impact.series.find((point) => point.date === date)?.actions || 0) + activities.filter((entry) => entry.occurredOn === date).length,
    co2eKgAvoided: round((impact.series.find((point) => point.date === date)?.co2eKgAvoided || 0) + activities.filter((entry) => entry.occurredOn === date).reduce((sum, entry) => sum + entry.avoidedKgCo2e, 0), 2),
    grossKgCo2e: round(activities.filter((entry) => entry.occurredOn === date).reduce((sum, entry) => sum + entry.grossKgCo2e, 0), 2),
    retiredOffsetKgCo2e: 0,
  })).slice(-31);
  const treeFactor = IMPACT_EQUIVALENCIES[0].kgCo2ePerUnit;
  return {
    period,
    grossTrackedKgCo2e,
    avoidedKgCo2e,
    retiredOffsetKgCo2e: retired,
    netBalanceKgCo2e: round(Math.max(0, grossTrackedKgCo2e - avoidedKgCo2e - retired), 2),
    metrics: { ...impact.metrics, co2eKgAvoided: avoidedKgCo2e },
    totalActions: impact.totalActions + activities.length,
    challengeStreak: impact.challengeStreak,
    series,
    countryBenchmark: FOOTPRINT_BENCHMARKS.find((benchmark) => benchmark.regionCode === countryCode) || null,
    globalBenchmark: FOOTPRINT_BENCHMARKS[0],
    treeSeedlingEquivalent: round(avoidedKgCo2e / treeFactor, 2),
  };
}

export function categoriesForInterests(interests: string[]): ImpactCategory[] {
  const categories = interests.flatMap((interest) => INTEREST_CATEGORY_MAP[interest] || []);
  return Array.from(new Set(categories));
}

export function deterministicIndex(seed: string, length: number): number {
  if (length <= 0) return 0;
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % length;
}

export function selectDailyChallenge({ userId, date, stage, interests }: { userId: string; date: string; stage: LearningStage; interests: string[] }): DailyEcoChallenge {
  const levels: LearningStage[] = stage === 'advanced' ? ['beginner', 'intermediate', 'advanced'] : stage === 'intermediate' ? ['beginner', 'intermediate'] : ['beginner'];
  const preferredCategories = categoriesForInterests(interests);
  const eligible = DAILY_CHALLENGES.filter((challenge) => challenge.active && levels.includes(challenge.difficulty));
  const personalized = preferredCategories.length ? eligible.filter((challenge) => preferredCategories.includes(challenge.category)) : eligible;
  const pool = personalized.length ? personalized : eligible;
  return pool[deterministicIndex(`${userId}:${date}:challenge`, pool.length)];
}

export function selectDailyPoll(userId: string, date: string): SustainabilityPoll {
  return DAILY_POLLS[deterministicIndex(`${userId}:${date}:poll`, DAILY_POLLS.length)];
}

export function calculateTravelEstimate(input: TravelEstimateInput, calculatedAt = new Date().toISOString()): TravelEstimate {
  const distance = Number(input.distanceKm);
  if (!Number.isFinite(distance) || distance <= 0) throw new Error('Distance must be greater than zero.');
  const totalDistanceKm = distance * (input.roundTrip ? 2 : 1);
  const occupancy = clamp(Math.round(Number(input.carOccupancy) || 1), 1, 9);
  const options = Object.values(TRAVEL_FACTORS).map((factor) => {
    const occupancyDivisor = factor.code === 'car' ? occupancy : 1;
    return { mode: factor.code, emissionsKgCo2e: round(totalDistanceKm * factor.kgCo2ePerPassengerKm / occupancyDivisor, 2), factor };
  });
  const selected = options.find((option) => option.mode === input.selectedMode)!;
  const comparison = options.find((option) => option.mode === input.comparisonMode)!;
  const differenceKgCo2e = round(selected.emissionsKgCo2e - comparison.emissionsKgCo2e, 2);
  return { input: { ...input, carOccupancy: occupancy }, totalDistanceKm: round(totalDistanceKm, 2), selected, comparison, differenceKgCo2e, avoidedKgCo2e: round(Math.max(0, comparison.emissionsKgCo2e - selected.emissionsKgCo2e), 2), options, calculatedAt };
}

export function addImpactMetrics(...metrics: (Partial<ImpactMetrics> | undefined)[]): ImpactMetrics {
  return metrics.reduce<ImpactMetrics>((total, metric) => ({
    co2eKgAvoided: round(total.co2eKgAvoided + (metric?.co2eKgAvoided || 0), 2),
    plasticItemsAvoided: total.plasticItemsAvoided + (metric?.plasticItemsAvoided || 0),
    wasteKgAvoided: round(total.wasteKgAvoided + (metric?.wasteKgAvoided || 0), 2),
    waterLitresSaved: round(total.waterLitresSaved + (metric?.waterLitresSaved || 0), 1),
  }), { co2eKgAvoided: 0, plasticItemsAvoided: 0, wasteKgAvoided: 0, waterLitresSaved: 0 });
}

export function createPrivacySafeShareSummary({ challengeTitle, metrics, streak }: { challengeTitle?: string; metrics: ImpactMetrics; streak: number }): string {
  const lines = ['My Green Compass impact'];
  if (challengeTitle) lines.push(`Completed: ${challengeTitle}`);
  if (metrics.co2eKgAvoided > 0) lines.push(`${round(metrics.co2eKgAvoided)} kg CO₂e avoided`);
  if (metrics.plasticItemsAvoided > 0) lines.push(`${metrics.plasticItemsAvoided} plastic items avoided`);
  if (metrics.wasteKgAvoided > 0) lines.push(`${round(metrics.wasteKgAvoided)} kg waste avoided`);
  if (metrics.waterLitresSaved > 0) lines.push(`${round(metrics.waterLitresSaved, 0)} L water saved`);
  if (streak > 0) lines.push(`${streak}-day eco-challenge streak`);
  lines.push('#GreenCompass #Sustainability');
  return lines.join('\n');
}
