import { DAILY_CHALLENGES, DAILY_POLLS, INTEREST_CATEGORY_MAP, TRAVEL_FACTORS, UK_ELECTRICITY_KG_CO2E_PER_KWH } from './catalog';
import type {
  DailyEcoChallenge,
  GreenIdentityAnswers,
  GreenIdentityResult,
  ImpactCategory,
  ImpactMetrics,
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
  const energyScore = clamp(100 - energyFootprint / 12, 0, 100);
  const foodScore = { meat_most_days: 25, meat_some_days: 55, vegetarian: 80, vegan: 95 }[answers.diet];
  const reuseScore = { rarely: 25, sometimes: 60, often: 90 }[answers.reuseFrequency];
  const recyclingScore = { rarely: 20, sometimes: 60, often: 90 }[answers.recyclingFrequency];
  const circularityScore = (reuseScore + recyclingScore) / 2;
  const identityScore = Math.round(mobilityScore * 0.35 + energyScore * 0.3 + foodScore * 0.2 + circularityScore * 0.15);
  const identityTier = identityScore >= 70 ? 'impact_leader' : identityScore >= 40 ? 'green_builder' : 'eco_explorer';

  return {
    assessmentVersion: '2026.1',
    identityScore,
    identityTier,
    annualBaselineKgCo2e: round(mobilityFootprint + energyFootprint),
    categoryScores: { mobility: Math.round(mobilityScore), energy: Math.round(energyScore), food: foodScore, circularity: Math.round(circularityScore) },
    categoryFootprintKgCo2e: { mobility: round(mobilityFootprint), energy: round(energyFootprint) },
    answers,
    completedAt,
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
