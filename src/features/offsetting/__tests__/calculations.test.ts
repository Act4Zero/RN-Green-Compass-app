import {
  addImpactMetrics,
  calculateGreenIdentity,
  calculateTravelEstimate,
  createPrivacySafeShareSummary,
  deriveLearningStage,
  selectDailyChallenge,
  selectDailyPoll,
} from '../calculations';
import { DAILY_CHALLENGES, FACTOR_VERSION, TRAVEL_FACTORS } from '../catalog';
import type { GreenIdentityAnswers } from '../types';

const answers: GreenIdentityAnswers = {
  weeklyDistanceKm: 100,
  primaryTravelMode: 'car',
  flightsPerYear: 2,
  householdEnergyKwhMonth: 240,
  renewableEnergyPercent: 25,
  householdSize: 2,
  diet: 'meat_some_days',
  reuseFrequency: 'sometimes',
  recyclingFrequency: 'often',
};

describe('offsetting calculations', () => {
  test('catalog contains at least 30 reviewed daily challenges', () => {
    expect(DAILY_CHALLENGES).toHaveLength(30);
    expect(new Set(DAILY_CHALLENGES.map((item) => item.category)).size).toBe(6);
  });

  test('green identity calculation is bounded and versioned', () => {
    const result = calculateGreenIdentity(answers, '2026-08-21T00:00:00.000Z');
    expect(result.assessmentVersion).toBe('2026.1');
    expect(result.identityScore).toBeGreaterThanOrEqual(0);
    expect(result.identityScore).toBeLessThanOrEqual(100);
    expect(result.annualBaselineKgCo2e).toBeGreaterThan(0);
    expect(result.categoryFootprintKgCo2e.mobility).toBeGreaterThan(0);
  });

  test.each([[0, 'beginner'], [9, 'beginner'], [10, 'intermediate'], [49, 'intermediate'], [50, 'advanced']])('derives learning stage at %s actions', (actions, expected) => {
    expect(deriveLearningStage(actions as number)).toBe(expected);
  });

  test('daily challenge and poll are deterministic and stage-safe', () => {
    const first = selectDailyChallenge({ userId: 'user-1', date: '2026-08-21', stage: 'beginner', interests: ['Clean Energy'] });
    const second = selectDailyChallenge({ userId: 'user-1', date: '2026-08-21', stage: 'beginner', interests: ['Clean Energy'] });
    expect(second).toEqual(first);
    expect(first.difficulty).toBe('beginner');
    expect(first.category).toBe('energy');
    expect(selectDailyPoll('user-1', '2026-08-21')).toEqual(selectDailyPoll('user-1', '2026-08-21'));
  });

  test('travel comparison handles all modes, round trips, and car occupancy', () => {
    const estimate = calculateTravelEstimate({ distanceKm: 100, roundTrip: true, carOccupancy: 2, selectedMode: 'train', comparisonMode: 'car' }, '2026-08-21T00:00:00.000Z');
    expect(estimate.totalDistanceKm).toBe(200);
    expect(estimate.options.map((option) => option.mode).sort()).toEqual(['boat', 'bus', 'car', 'plane', 'train']);
    expect(estimate.selected.emissionsKgCo2e).toBeLessThan(estimate.comparison.emissionsKgCo2e);
    expect(estimate.avoidedKgCo2e).toBeGreaterThan(0);
    expect(() => calculateTravelEstimate({ distanceKm: 0, roundTrip: false, carOccupancy: 1, selectedMode: 'bus', comparisonMode: 'car' })).toThrow('Distance');
    expect(() => calculateTravelEstimate({ distanceKm: -10, roundTrip: false, carOccupancy: 1, selectedMode: 'bus', comparisonMode: 'car' })).toThrow('Distance');
    expect(() => calculateTravelEstimate({ distanceKm: Number.NaN, roundTrip: false, carOccupancy: 1, selectedMode: 'bus', comparisonMode: 'car' })).toThrow('Distance');
  });

  test('uses the reviewed July 2026 factor boundary for every travel mode', () => {
    expect(FACTOR_VERSION).toBe('DESNZ-2026-JULY-v1');
    expect(Object.fromEntries(Object.entries(TRAVEL_FACTORS).map(([mode, factor]) => [mode, factor.kgCo2ePerPassengerKm]))).toEqual({
      plane: 0.15072,
      train: 0.03989,
      bus: 0.128,
      boat: 0.13825,
      car: 0.2099,
    });
  });

  test('impact metrics aggregate without crossing units', () => {
    expect(addImpactMetrics({ co2eKgAvoided: 1.25, plasticItemsAvoided: 2 }, { co2eKgAvoided: 0.75, waterLitresSaved: 10 })).toEqual({
      co2eKgAvoided: 2,
      plasticItemsAvoided: 2,
      wasteKgAvoided: 0,
      waterLitresSaved: 10,
    });
  });

  test('share summary never includes private reflection fields', () => {
    const summary = createPrivacySafeShareSummary({ challengeTitle: 'Walk one short trip', metrics: { co2eKgAvoided: 1.4, plasticItemsAvoided: 0, wasteKgAvoided: 0, waterLitresSaved: 0 }, streak: 3 });
    expect(summary).toContain('1.4 kg CO₂e avoided');
    expect(summary).toContain('3-day');
    expect(summary).not.toMatch(/gratitude|journal|actionNote/i);
  });
});
