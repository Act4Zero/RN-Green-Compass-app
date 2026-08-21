export type GreenIdentityTier = 'eco_explorer' | 'green_builder' | 'impact_leader';
export type LearningStage = 'beginner' | 'intermediate' | 'advanced';
export type ImpactCategory = 'plastic' | 'food' | 'energy' | 'mobility' | 'water' | 'reuse';
export type TravelMode = 'plane' | 'train' | 'bus' | 'boat' | 'car';

export interface GreenIdentityAnswers {
  weeklyDistanceKm: number;
  primaryTravelMode: TravelMode;
  flightsPerYear: number;
  householdEnergyKwhMonth: number;
  renewableEnergyPercent: number;
  householdSize: number;
  diet: 'meat_most_days' | 'meat_some_days' | 'vegetarian' | 'vegan';
  reuseFrequency: 'rarely' | 'sometimes' | 'often';
  recyclingFrequency: 'rarely' | 'sometimes' | 'often';
}

export interface GreenIdentityResult {
  assessmentVersion: string;
  identityScore: number;
  identityTier: GreenIdentityTier;
  annualBaselineKgCo2e: number;
  categoryScores: Record<'mobility' | 'energy' | 'food' | 'circularity', number>;
  categoryFootprintKgCo2e: Record<'mobility' | 'energy', number>;
  answers: GreenIdentityAnswers;
  completedAt: string;
}

export interface ImpactMetrics {
  co2eKgAvoided: number;
  plasticItemsAvoided: number;
  wasteKgAvoided: number;
  waterLitresSaved: number;
}

export interface DailyEcoChallenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ImpactCategory;
  difficulty: LearningStage;
  impact: Partial<ImpactMetrics>;
  knowledgeSlug: string;
  points: number;
  active: boolean;
}

export interface DailyChallengeAssignment {
  id?: string;
  challengeDate: string;
  completedAt: string | null;
  challenge: DailyEcoChallenge;
}

export interface DailyReflection {
  reflectionDate: string;
  didSustainableAction: boolean | null;
  actionNote: string;
  gratitudeNote: string;
  journalNote: string;
  updatedAt?: string;
}

export interface SustainabilityPollOption {
  id: string;
  label: string;
  count?: number;
}

export interface SustainabilityPoll {
  id: string;
  slug: string;
  question: string;
  pollDate?: string;
  options: SustainabilityPollOption[];
  selectedOptionId?: string | null;
}

export interface EmissionFactor {
  code: TravelMode;
  version: string;
  label: string;
  kgCo2ePerPassengerKm: number;
  sourceLabel: string;
  sourceUrl: string;
}

export interface TravelEstimateInput {
  distanceKm: number;
  roundTrip: boolean;
  carOccupancy: number;
  selectedMode: TravelMode;
  comparisonMode: TravelMode;
}

export interface TravelOptionEstimate {
  mode: TravelMode;
  emissionsKgCo2e: number;
  factor: EmissionFactor;
}

export interface TravelEstimate {
  input: TravelEstimateInput;
  totalDistanceKm: number;
  selected: TravelOptionEstimate;
  comparison: TravelOptionEstimate;
  differenceKgCo2e: number;
  avoidedKgCo2e: number;
  options: TravelOptionEstimate[];
  calculatedAt: string;
}

export interface ImpactSeriesPoint {
  date: string;
  co2eKgAvoided: number;
  actions: number;
}

export interface ImpactSummary {
  period: 'day' | 'week' | 'month';
  metrics: ImpactMetrics;
  totalActions: number;
  challengeStreak: number;
  byCategory: Partial<Record<ImpactCategory, ImpactMetrics>>;
  series: ImpactSeriesPoint[];
}

export interface OffsettingDashboard {
  identity: GreenIdentityResult | null;
  learningStage: LearningStage;
  dailyChallenge: DailyChallengeAssignment | null;
  reflection: DailyReflection | null;
  poll: SustainabilityPoll | null;
  impact: ImpactSummary;
}
