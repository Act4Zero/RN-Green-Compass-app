export type GreenIdentityTier = 'eco_explorer' | 'green_builder' | 'impact_leader';
export type LearningStage = 'beginner' | 'intermediate' | 'advanced';
export type ImpactCategory = 'plastic' | 'food' | 'energy' | 'mobility' | 'water' | 'reuse';
export type TravelMode = 'plane' | 'train' | 'bus' | 'boat' | 'car';
export type GreenIdentityCategory = 'mobility' | 'energy' | 'food' | 'consumption' | 'waste' | 'circularity';
export type HeatingType = 'none' | 'electricity' | 'natural_gas' | 'heating_oil' | 'district';
export type ShoppingLevel = 'low' | 'average' | 'high';
export type WasteFrequency = 'rarely' | 'sometimes' | 'often';
export type CarbonActivityCategory = 'transport' | 'electricity' | 'heating' | 'food' | 'purchases' | 'waste';
export type CarbonGoalType = 'actions' | 'frequency' | 'kg_co2e' | 'absolute_reduction' | 'percent_reduction';
export type OffsetContributionStatus = 'pending' | 'failed' | 'cancelled' | 'fulfilled' | 'retired';

export interface GreenIdentityAnswers {
  countryCode?: string;
  weeklyDistanceKm: number;
  primaryTravelMode: TravelMode;
  flightsPerYear: number;
  householdEnergyKwhMonth: number;
  renewableEnergyPercent: number;
  householdSize: number;
  diet: 'meat_most_days' | 'meat_some_days' | 'vegetarian' | 'vegan';
  reuseFrequency: 'rarely' | 'sometimes' | 'often';
  recyclingFrequency: 'rarely' | 'sometimes' | 'often';
  heatingType?: HeatingType;
  heatingEnergyKwhMonth?: number;
  shoppingLevel?: ShoppingLevel;
  foodWasteFrequency?: WasteFrequency;
}

export interface GreenIdentityResult {
  assessmentVersion: string;
  identityScore: number;
  identityTier: GreenIdentityTier;
  annualBaselineKgCo2e: number;
  categoryScores: Partial<Record<GreenIdentityCategory, number>>;
  categoryFootprintKgCo2e: Partial<Record<GreenIdentityCategory, number>>;
  countryCode?: string;
  factorVersions?: string[];
  isPartial?: boolean;
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

export interface CarbonActivityFactor {
  code: string;
  activity: CarbonActivityCategory;
  label: string;
  unit: string;
  regionCode: string;
  kgCo2ePerUnit: number;
  version: string;
  methodology: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface CarbonActivityInput {
  factorCode: string;
  quantity: number;
  occurredOn: string;
  comparisonFactorCode?: string | null;
  notes?: string;
  sourceEventId?: string | null;
}

export interface CarbonActivityEntry {
  id?: string;
  factorCode: string;
  factorVersion: string;
  category: CarbonActivityCategory;
  label: string;
  quantity: number;
  unit: string;
  grossKgCo2e: number;
  comparisonKgCo2e: number | null;
  avoidedKgCo2e: number;
  occurredOn: string;
  notes: string;
  sourceEventId?: string | null;
  createdAt?: string;
}

export interface FootprintBenchmark {
  regionCode: string;
  regionName: string;
  year: number;
  tonnesCo2ePerCapita: number;
  scope: 'territorial_ghg_excluding_lulucf';
  version: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface CarbonGoalStep {
  id?: string;
  title: string;
  completedAt?: string | null;
  knowledgeSlug?: string | null;
}

export interface CarbonGoalDefinition {
  id?: string;
  title: string;
  category: CarbonActivityCategory;
  goalType: CarbonGoalType;
  targetValue: number;
  unit: string;
  startsOn: string;
  endsOn: string;
  baselineValue?: number | null;
  baselineSource?: 'history' | 'self_reported' | null;
  steps: CarbonGoalStep[];
}

export interface CarbonGoalProgress extends CarbonGoalDefinition {
  id: string;
  currentValue: number;
  percentComplete: number;
  status: 'active' | 'completed' | 'expired';
}

export interface OffsetProject {
  id: string;
  provider: 'cloverly';
  providerProjectId: string;
  name: string;
  summary: string;
  country: string;
  technology: string;
  standard: string;
  registryUrl: string;
  permanence: string;
  pricePerTonneMinor: number;
  currency: string;
  imageUrl?: string | null;
  active: boolean;
}

export interface OffsetContribution {
  id: string;
  projectId: string;
  projectName: string;
  providerReference: string;
  status: OffsetContributionStatus;
  quantityKgCo2e: number;
  amountMinor: number;
  currency: string;
  certificateUrl?: string | null;
  registryReference?: string | null;
  contributedAt: string;
}

export interface CarbonBalanceSummary {
  period: ImpactSummary['period'];
  grossTrackedKgCo2e: number;
  avoidedKgCo2e: number;
  retiredOffsetKgCo2e: number;
  netBalanceKgCo2e: number;
  metrics: ImpactMetrics;
  totalActions: number;
  challengeStreak: number;
  series: (ImpactSeriesPoint & { grossKgCo2e: number; retiredOffsetKgCo2e: number })[];
  countryBenchmark: FootprintBenchmark | null;
  globalBenchmark: FootprintBenchmark;
  treeSeedlingEquivalent: number;
}

export interface ReminderPreference {
  enabled: boolean;
  hour: number;
  minute: number;
  weekdays: number[];
  timezone: string;
  notificationIds: string[];
  updatedAt?: string;
}

export interface ImpactEquivalency {
  code: string;
  version: string;
  label: string;
  kgCo2ePerUnit: number;
  methodology: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface PersonalizedCarbonTip {
  id: string;
  category: CarbonActivityCategory;
  title: string;
  description: string;
  expectedImpact: string;
  assumption: string;
  knowledgeSlug: string;
}

export interface OffsettingDashboard {
  identity: GreenIdentityResult | null;
  learningStage: LearningStage;
  dailyChallenge: DailyChallengeAssignment | null;
  reflection: DailyReflection | null;
  poll: SustainabilityPoll | null;
  impact: ImpactSummary;
}
