import supabase from '@/lib/supabase';
import { knowledgeService, type KnowledgeItemSummary } from '@/features/knowledge';
import { habitService } from '@/services/habitService';
import { addImpactMetrics, calculateTravelEstimate, deriveLearningStage, selectDailyChallenge, selectDailyPoll } from './calculations';
import { offsettingStorage } from './storage';
import type {
  DailyChallengeAssignment,
  DailyEcoChallenge,
  DailyReflection,
  GreenIdentityResult,
  ImpactSummary,
  LearningStage,
  OffsettingDashboard,
  SustainabilityPoll,
  TravelEstimate,
  TravelEstimateInput,
} from './types';

const normalizeChallenge = (row: any): DailyEcoChallenge => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  description: row.description,
  category: row.category,
  difficulty: row.difficulty,
  impact: row.impact || {},
  knowledgeSlug: row.knowledge_slug || row.knowledgeSlug || '',
  points: row.points ?? 5,
  active: row.active ?? true,
});

const normalizeIdentity = (row: any): GreenIdentityResult => ({
  assessmentVersion: row.assessment_version,
  identityScore: row.identity_score,
  identityTier: row.identity_tier,
  annualBaselineKgCo2e: Number(row.annual_baseline_kg_co2e || 0),
  categoryScores: row.category_scores,
  categoryFootprintKgCo2e: row.category_footprint_kg_co2e,
  answers: row.answers,
  completedAt: row.completed_at,
});

function calculateChallengeStreak(dates: string[], today = new Date()): number {
  const set = new Set(dates);
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!set.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const offsettingService = {
  async getIdentity(userId: string): Promise<GreenIdentityResult | null> {
    try {
      const { data, error } = await (supabase as any).from('user_green_identities').select('*').eq('user_id', userId).maybeSingle();
      if (!error && data) {
        const identity = normalizeIdentity(data);
        await offsettingStorage.saveIdentity(userId, identity);
        return identity;
      }
    } catch {
      // The device copy supports development and temporary network loss.
    }
    return offsettingStorage.getIdentity(userId);
  },

  async saveIdentity(userId: string, result: GreenIdentityResult): Promise<GreenIdentityResult> {
    await offsettingStorage.saveIdentity(userId, result);
    try {
      const { error } = await (supabase as any).from('user_green_identities').upsert({
        user_id: userId,
        assessment_version: result.assessmentVersion,
        answers: result.answers,
        identity_score: result.identityScore,
        identity_tier: result.identityTier,
        annual_baseline_kg_co2e: result.annualBaselineKgCo2e,
        category_scores: result.categoryScores,
        category_footprint_kg_co2e: result.categoryFootprintKgCo2e,
        completed_at: result.completedAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch {
      // The locally saved assessment is retried on the next explicit save.
    }
    return result;
  },

  async getCompletedActionCount(userId: string): Promise<number> {
    try {
      const [{ count: habitCount }, { count: challengeCount }] = await Promise.all([
        (supabase as any).from('habit_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('completed', true),
        (supabase as any).from('user_daily_challenges').select('id', { count: 'exact', head: true }).eq('user_id', userId).not('completed_at', 'is', null),
      ]);
      return Number(habitCount || 0) + Number(challengeCount || 0);
    } catch {
      return habitService.calculateTotalActions(userId).catch(() => 0);
    }
  },

  async getLearningStage(userId: string): Promise<LearningStage> {
    return deriveLearningStage(await this.getCompletedActionCount(userId));
  },

  async getDailyChallenge(userId: string, date: string, stage: LearningStage, interests: string[]): Promise<DailyChallengeAssignment> {
    const cached = await offsettingStorage.getAssignment(userId, date);
    try {
      const { data, error } = await (supabase as any).rpc('assign_daily_eco_challenge', { p_local_date: date, p_interests: interests, p_learning_stage: stage });
      if (!error && data) {
        const row = Array.isArray(data) ? data[0] : data;
        const assignment = { id: row.assignment_id || row.id, challengeDate: date, completedAt: row.completed_at || null, challenge: normalizeChallenge(row.challenge || row) };
        return offsettingStorage.saveAssignment(userId, assignment);
      }
    } catch {
      // Use the deterministic reviewed catalog until the migration is available.
    }
    if (cached) return cached;
    return offsettingStorage.saveAssignment(userId, { challengeDate: date, completedAt: null, challenge: selectDailyChallenge({ userId, date, stage, interests }) });
  },

  async completeDailyChallenge(userId: string, assignment: DailyChallengeAssignment): Promise<DailyChallengeAssignment> {
    if (assignment.completedAt) return assignment;
    const completedAt = new Date().toISOString();
    const completed = { ...assignment, completedAt };
    await offsettingStorage.saveAssignment(userId, completed);
    try {
      const { data, error } = await (supabase as any).rpc('complete_daily_eco_challenge', { p_challenge_id: assignment.challenge.id, p_challenge_date: assignment.challengeDate, p_event_id: cryptoRandomId() });
      if (error) throw error;
      if (data?.completed_at) completed.completedAt = data.completed_at;
    } catch {
      // A repeated completion remains locally idempotent and can be retried safely.
    }
    return offsettingStorage.saveAssignment(userId, completed);
  },

  async getReflection(userId: string, date: string): Promise<DailyReflection | null> {
    try {
      const { data, error } = await (supabase as any).from('user_daily_reflections').select('*').eq('user_id', userId).eq('reflection_date', date).maybeSingle();
      if (!error && data) {
        const value = { reflectionDate: data.reflection_date, didSustainableAction: data.did_sustainable_action, actionNote: data.action_note || '', gratitudeNote: data.gratitude_note || '', journalNote: data.journal_note || '', updatedAt: data.updated_at };
        return offsettingStorage.saveReflection(userId, value);
      }
    } catch {
      // Fall through to owner-scoped device storage.
    }
    return offsettingStorage.getReflection(userId, date);
  },

  async saveReflection(userId: string, reflection: DailyReflection): Promise<DailyReflection> {
    const bounded = (text: string) => text.trim().slice(0, 1000);
    const value = {
      ...reflection,
      actionNote: bounded(reflection.actionNote),
      gratitudeNote: bounded(reflection.gratitudeNote),
      journalNote: bounded(reflection.journalNote),
      updatedAt: new Date().toISOString(),
    };
    await offsettingStorage.saveReflection(userId, value);
    try {
      const { error } = await (supabase as any).from('user_daily_reflections').upsert({
        user_id: userId,
        reflection_date: value.reflectionDate,
        did_sustainable_action: value.didSustainableAction,
        action_note: value.actionNote,
        gratitude_note: value.gratitudeNote,
        journal_note: value.journalNote,
        updated_at: value.updatedAt,
      }, { onConflict: 'user_id,reflection_date' });
      if (error) throw error;
    } catch {
      // Preserve the private local copy when remote persistence is unavailable.
    }
    return value;
  },

  async getDailyPoll(userId: string, date: string): Promise<SustainabilityPoll> {
    const fallback = selectDailyPoll(userId, date);
    const selectedOptionId = await offsettingStorage.getPollResponse(userId, date);
    try {
      const { data, error } = await (supabase as any).rpc('get_daily_sustainability_poll', { p_local_date: date });
      if (!error && data) {
        const row = Array.isArray(data) ? data[0] : data;
        return { id: row.id, slug: row.slug, question: row.question, pollDate: date, options: row.options || [], selectedOptionId: row.selected_option_id || null };
      }
    } catch {
      // Reviewed local polls keep the daily experience useful offline.
    }
    return { ...fallback, pollDate: date, selectedOptionId };
  },

  async respondToPoll(userId: string, poll: SustainabilityPoll, optionId: string): Promise<SustainabilityPoll> {
    if (!poll.options.some((option) => option.id === optionId)) throw new Error('Invalid poll option.');
    const pollDate = poll.pollDate || currentLocalDate();
    await offsettingStorage.savePollResponse(userId, pollDate, optionId);
    let options = poll.options;
    try {
      const { data, error } = await (supabase as any).rpc('respond_to_sustainability_poll', { p_poll_id: poll.id, p_option_id: optionId, p_local_date: pollDate });
      if (error) throw error;
      if (Array.isArray(data)) options = data;
    } catch {
      options = options.map((option) => ({ ...option, count: (option.count || 0) + Number(option.id === optionId) }));
    }
    return { ...poll, pollDate, options, selectedOptionId: optionId };
  },

  calculateTravel(input: TravelEstimateInput): TravelEstimate {
    return calculateTravelEstimate(input);
  },

  async saveTravelEstimate(userId: string, estimate: TravelEstimate): Promise<TravelEstimate> {
    await offsettingStorage.saveTravelEntry(userId, estimate);
    try {
      const { error } = await (supabase as any).from('travel_footprint_entries').insert({
        user_id: userId,
        occurred_on: new Date().toISOString().slice(0, 10),
        distance_km: estimate.input.distanceKm,
        total_distance_km: estimate.totalDistanceKm,
        round_trip: estimate.input.roundTrip,
        car_occupancy: estimate.input.carOccupancy,
        selected_mode: estimate.input.selectedMode,
        comparison_mode: estimate.input.comparisonMode,
        emissions_kg_co2e: estimate.selected.emissionsKgCo2e,
        comparison_emissions_kg_co2e: estimate.comparison.emissionsKgCo2e,
        avoided_kg_co2e: estimate.avoidedKgCo2e,
        factor_version: estimate.selected.factor.version,
      });
      if (error) throw error;
    } catch {
      // Keep the confirmed estimate on device for later review.
    }
    return estimate;
  },

  async getImpactSummary(userId: string, period: ImpactSummary['period'] = 'week'): Promise<ImpactSummary> {
    try {
      const { data, error } = await (supabase as any).rpc('get_user_offsetting_impact', { p_period: period });
      if (!error && data) return data as ImpactSummary;
    } catch {
      // Aggregate the existing habit ledger plus owner-scoped device entries.
    }
    const logs = await habitService.getHabitLogs(userId).catch(() => []);
    const travel = await offsettingStorage.getTravelEntries(userId);
    const habitMetrics = { co2eKgAvoided: logs.reduce((sum, log) => sum + (log.co2_saving || 0), 0) };
    const travelMetrics = { co2eKgAvoided: travel.reduce((sum, entry) => sum + entry.avoidedKgCo2e, 0) };
    const metrics = addImpactMetrics(habitMetrics, travelMetrics);
    return { period, metrics, totalActions: logs.length + travel.length, challengeStreak: 0, byCategory: {}, series: groupLogsByDate(logs) };
  },

  async getDashboard(userId: string, date: string, interests: string[] = []): Promise<OffsettingDashboard> {
    const [identity, learningStage, impact, reflection] = await Promise.all([
      this.getIdentity(userId),
      this.getLearningStage(userId),
      this.getImpactSummary(userId, 'week'),
      this.getReflection(userId, date),
    ]);
    const [dailyChallenge, poll] = await Promise.all([
      this.getDailyChallenge(userId, date, learningStage, interests),
      this.getDailyPoll(userId, date),
    ]);
    return { identity, learningStage, impact, reflection, dailyChallenge, poll };
  },

  async getPersonalizedKnowledge(interests: string[], activeCategories: string[], userId?: string, stage: LearningStage = 'beginner'): Promise<KnowledgeItemSummary[]> {
    const home = await knowledgeService.getKnowledgeHome({ userId, interests, activeCategories });
    const allowedDifficulty = stage === 'advanced' ? ['beginner', 'intermediate', 'advanced'] : stage === 'intermediate' ? ['beginner', 'intermediate'] : ['beginner'];
    return [...home.recommendations, ...home.interactive]
      .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
      .filter((item) => allowedDifficulty.includes(item.difficulty))
      .slice(0, 4);
  },

  calculateChallengeStreak,
};

function groupLogsByDate(logs: any[]) {
  const grouped = new Map<string, { date: string; co2eKgAvoided: number; actions: number }>();
  logs.forEach((log) => {
    const date = String(log.log_date || log.created_at).slice(0, 10);
    const current = grouped.get(date) || { date, co2eKgAvoided: 0, actions: 0 };
    current.co2eKgAvoided += Number(log.co2_saving || 0);
    current.actions += 1;
    grouped.set(date, current);
  });
  return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-31);
}

function cryptoRandomId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
}

function currentLocalDate(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
