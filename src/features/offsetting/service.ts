import supabase from '@/lib/supabase';
import { knowledgeService, type KnowledgeItemSummary, type KnowledgeLocale } from '@/features/knowledge';
import { habitService } from '@/services/habitService';
import { ACTIVITY_FACTORS, FOOTPRINT_BENCHMARKS, IMPACT_EQUIVALENCIES, OFFSET_PROJECTS, PERSONALIZED_CARBON_TIPS } from './catalog';
import { addImpactMetrics, calculateCarbonActivity, calculateCarbonGoalProgress, calculateTravelEstimate, createCarbonBalance, deriveLearningStage, getProgressLevel, selectDailyChallenge, selectDailyPoll } from './calculations';
import { offsettingStorage } from './storage';
import type {
  CarbonActivityEntry,
  CarbonActivityInput,
  CarbonBalanceSummary,
  CarbonGoalDefinition,
  CarbonGoalProgress,
  DailyChallengeAssignment,
  DailyEcoChallenge,
  DailyReflection,
  GreenIdentityResult,
  ImpactSummary,
  LearningStage,
  OffsetContribution,
  OffsetProject,
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
  countryCode: row.country_code || row.answers?.countryCode || 'GLOBAL',
  factorVersions: row.factor_versions || [],
  isPartial: row.assessment_version !== '2026.2',
  answers: row.answers,
  completedAt: row.completed_at,
});

const normalizeActivity = (row: any): CarbonActivityEntry => ({
  id: row.id,
  factorCode: row.factor_code,
  factorVersion: row.factor_version,
  category: row.category,
  label: row.label,
  quantity: Number(row.quantity),
  unit: row.unit,
  grossKgCo2e: Number(row.gross_kg_co2e),
  comparisonKgCo2e: row.comparison_kg_co2e === null ? null : Number(row.comparison_kg_co2e),
  avoidedKgCo2e: Number(row.avoided_kg_co2e || 0),
  occurredOn: row.occurred_on,
  notes: row.notes || '',
  sourceEventId: row.source_event_id,
  createdAt: row.created_at,
});

const normalizeContribution = (row: any): OffsetContribution => ({
  id: row.id,
  projectId: row.project_id,
  projectName: row.offset_projects?.name || row.project_name || 'Offset project',
  providerReference: row.provider_reference,
  status: row.status,
  quantityKgCo2e: Number(row.quantity_kg_co2e || 0),
  amountMinor: Number(row.amount_minor || 0),
  currency: row.currency || 'USD',
  certificateUrl: row.certificate_url,
  registryReference: row.registry_reference,
  contributedAt: row.retired_at || row.fulfilled_at || row.created_at,
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
        country_code: result.countryCode || result.answers.countryCode || 'GLOBAL',
        factor_versions: result.factorVersions || [],
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

  getActivityFactors() {
    return ACTIVITY_FACTORS;
  },

  previewCarbonActivity(input: CarbonActivityInput): CarbonActivityEntry {
    return calculateCarbonActivity(input);
  },

  async getCarbonActivities(userId: string, startDate?: string): Promise<CarbonActivityEntry[]> {
    try {
      let query = (supabase as any).from('carbon_activity_entries').select('*').eq('user_id', userId).order('occurred_on', { ascending: false });
      if (startDate) query = query.gte('occurred_on', startDate);
      const { data, error } = await query;
      if (error) throw error;
      if (data) return data.map(normalizeActivity);
    } catch {
      // Owner-scoped device entries keep logging useful while offline or before migration.
    }
    const local = await offsettingStorage.getActivityEntries(userId);
    return startDate ? local.filter((entry) => entry.occurredOn >= startDate) : local;
  },

  async saveCarbonActivity(userId: string, input: CarbonActivityInput): Promise<CarbonActivityEntry> {
    const preview = calculateCarbonActivity(input);
    try {
      const { data, error } = await (supabase as any).rpc('log_carbon_activity', {
        p_factor_code: input.factorCode,
        p_quantity: input.quantity,
        p_occurred_on: input.occurredOn,
        p_comparison_factor_code: input.comparisonFactorCode || null,
        p_notes: (input.notes || '').trim().slice(0, 500),
        p_source_event_id: input.sourceEventId || null,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        void (supabase as any).rpc('evaluate_carbon_badges', { p_user_id: userId });
        return offsettingStorage.saveActivityEntry(userId, normalizeActivity(row));
      }
    } catch {
      // A deterministic sourceEventId prevents an offline check-in from duplicating on retry.
    }
    return offsettingStorage.saveActivityEntry(userId, preview);
  },

  async getCarbonGoals(userId: string): Promise<CarbonGoalProgress[]> {
    const activities = await this.getCarbonActivities(userId);
    try {
      const { data, error } = await (supabase as any).rpc('get_carbon_goals');
      if (error) throw error;
      if (Array.isArray(data)) {
        const goals = data.map(normalizeGoal);
        await offsettingStorage.saveCarbonGoals(userId, goals);
        return goals;
      }
    } catch {
      // Recalculate locally from the frozen goal definition and activity ledger.
    }
    const stored = await offsettingStorage.getCarbonGoals(userId);
    return stored.map((goal) => calculateCarbonGoalProgress(goal, activities));
  },

  async createCarbonGoal(userId: string, definition: CarbonGoalDefinition): Promise<CarbonGoalProgress> {
    if (!definition.title.trim() || definition.targetValue <= 0 || definition.endsOn < definition.startsOn) throw new Error('Enter a valid goal, target, and date range.');
    if (definition.goalType === 'percent_reduction' && (!definition.baselineValue || definition.baselineValue <= 0)) throw new Error('A positive baseline is required for a percentage goal.');
    try {
      const { data, error } = await (supabase as any).rpc('create_carbon_goal', {
        p_title: definition.title.trim(), p_category: definition.category, p_goal_type: definition.goalType,
        p_target_value: definition.targetValue, p_unit: definition.unit, p_starts_on: definition.startsOn,
        p_ends_on: definition.endsOn, p_baseline_value: definition.baselineValue || null,
        p_baseline_source: definition.baselineSource || null, p_steps: definition.steps,
      });
      if (error) throw error;
      const goal = normalizeGoal(Array.isArray(data) ? data[0] : data);
      const stored = await offsettingStorage.getCarbonGoals(userId);
      await offsettingStorage.saveCarbonGoals(userId, [goal, ...stored.filter((item) => item.id !== goal.id)]);
      return goal;
    } catch {
      const local = calculateCarbonGoalProgress({ ...definition, id: `local-${Date.now()}` }, []);
      const stored = await offsettingStorage.getCarbonGoals(userId);
      await offsettingStorage.saveCarbonGoals(userId, [local, ...stored]);
      return local;
    }
  },

  async completeCarbonGoalStep(userId: string, goalId: string, stepId: string, completed: boolean): Promise<void> {
    try {
      const { error } = await (supabase as any).rpc('set_carbon_goal_step_completed', { p_goal_id: goalId, p_step_id: stepId, p_completed: completed });
      if (error) throw error;
      return;
    } catch {
      const goals = await offsettingStorage.getCarbonGoals(userId);
      await offsettingStorage.saveCarbonGoals(userId, goals.map((goal) => goal.id === goalId ? { ...goal, steps: goal.steps.map((step) => step.id === stepId ? { ...step, completedAt: completed ? new Date().toISOString() : null } : step) } : goal));
    }
  },

  async getOffsetProjects(): Promise<OffsetProject[]> {
    try {
      const { data, error } = await (supabase as any).from('offset_projects').select('*').eq('active', true).order('name');
      if (error) throw error;
      if (data?.length) return data.map(normalizeProject);
    } catch {
      // Reviewed sandbox catalog is available before production provider activation.
    }
    return OFFSET_PROJECTS;
  },

  async createOffsetCheckout(projectId: string, quantityKgCo2e: number): Promise<{ checkoutUrl: string; sessionId: string }> {
    if (!Number.isFinite(quantityKgCo2e) || quantityKgCo2e < 1) throw new Error('Offset quantity must be at least 1 kg CO₂e.');
    const { data, error } = await (supabase as any).functions.invoke('create-offset-checkout', { body: { projectId, quantityKgCo2e } });
    if (error) throw error;
    if (!data?.checkoutUrl || !data?.sessionId) throw new Error('The secure checkout is not available yet.');
    return data;
  },

  async getOffsetHistory(userId: string): Promise<OffsetContribution[]> {
    try {
      const { data, error } = await (supabase as any).from('offset_contributions').select('*, offset_projects(name)').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const contributions = data.map(normalizeContribution);
        await offsettingStorage.saveOffsetContributions(userId, contributions);
        return contributions;
      }
    } catch {
      // Keep the last owner-scoped history visible offline.
    }
    return offsettingStorage.getOffsetContributions(userId);
  },

  async getCarbonBalance(userId: string, period: ImpactSummary['period'] = 'week'): Promise<CarbonBalanceSummary> {
    const startDate = periodStart(period);
    const [activities, impact, contributions, identity] = await Promise.all([
      this.getCarbonActivities(userId, startDate), this.getImpactSummary(userId, period), this.getOffsetHistory(userId), this.getIdentity(userId),
    ]);
    const retired = contributions.filter((entry) => entry.status === 'retired' || entry.status === 'fulfilled').reduce((sum, entry) => sum + entry.quantityKgCo2e, 0);
    return createCarbonBalance({ period, activities, retiredOffsetKgCo2e: retired, impact, countryCode: identity?.countryCode || identity?.answers.countryCode || 'GLOBAL' });
  },

  getBenchmarks() {
    return FOOTPRINT_BENCHMARKS;
  },

  getImpactEquivalencies() {
    return IMPACT_EQUIVALENCIES;
  },

  async getPersonalizedCarbonTips(userId: string, interests: string[] = [], activeCategories: string[] = []) {
    const goals = await this.getCarbonGoals(userId).catch(() => []);
    const priorities = new Set([...activeCategories, ...goals.filter((goal) => goal.status === 'active').map((goal) => goal.category)]);
    const interestText = interests.join(' ').toLowerCase();
    if (interestText.includes('food')) priorities.add('food');
    if (interestText.includes('energy') || interestText.includes('building')) { priorities.add('electricity'); priorities.add('heating'); }
    if (interestText.includes('transport')) priorities.add('transport');
    if (interestText.includes('waste') || interestText.includes('fashion')) { priorities.add('waste'); priorities.add('purchases'); }
    return [...PERSONALIZED_CARBON_TIPS].sort((a, b) => Number(priorities.has(b.category)) - Number(priorities.has(a.category))).slice(0, 3);
  },

  async getGamificationLevel(userId: string) {
    try {
      const { data, error } = await (supabase as any).rpc('get_user_points_total', { user_id_param: userId });
      if (error) throw error;
      const totalPoints = Number(data || 0);
      return { totalPoints, level: getProgressLevel(totalPoints) };
    } catch {
      return { totalPoints: 0, level: getProgressLevel(0) };
    }
  },

  async getLeaderboardOptIn(userId: string): Promise<boolean> {
    try {
      const { data, error } = await (supabase as any).from('profiles').select('leaderboard_opt_in').eq('id', userId).maybeSingle();
      if (error) throw error;
      return Boolean(data?.leaderboard_opt_in);
    } catch {
      return false;
    }
  },

  async setLeaderboardOptIn(userId: string, enabled: boolean): Promise<boolean> {
    const { error } = await (supabase as any).from('profiles').update({ leaderboard_opt_in: enabled, updated_at: new Date().toISOString() }).eq('id', userId);
    if (error) throw error;
    return enabled;
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

  async getPersonalizedKnowledge(interests: string[], activeCategories: string[], userId?: string, stage: LearningStage = 'beginner', locale: KnowledgeLocale = 'en'): Promise<KnowledgeItemSummary[]> {
    const home = await knowledgeService.getKnowledgeHome({ locale, userId, interests, activeCategories });
    const allowedDifficulty = stage === 'advanced' ? ['beginner', 'intermediate', 'advanced'] : stage === 'intermediate' ? ['beginner', 'intermediate'] : ['beginner'];
    const [goals, history] = userId ? await Promise.all([this.getCarbonGoals(userId).catch(() => []), offsettingStorage.getRecommendationHistory(userId)]) : [[], []];
    const priorityTerms = [...activeCategories, ...goals.filter((goal) => goal.status === 'active').map((goal) => goal.category), ...interests].map((value) => value.toLowerCase().replace(/\s+/g, '-'));
    const ranked = [...home.recommendations, ...home.interactive]
      .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
      .filter((item) => allowedDifficulty.includes(item.difficulty))
      .map((item, index) => {
        const searchable = [item.slug, item.title, item.summary, ...(item.topicSlugs || [])].join(' ').toLowerCase();
        const relevance = priorityTerms.reduce((score, term) => score + Number(searchable.includes(term.replace(/-/g, ' ')) || searchable.includes(term)) * 3, 0);
        return { item, score: relevance + Number(item.editorPick) - Number(history.includes(item.id)) * 2 - index / 100 };
      })
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
      .slice(0, 4);
    if (userId) await offsettingStorage.saveRecommendationHistory(userId, [...history, ...ranked.map((item) => item.id)]);
    return ranked;
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

function normalizeGoal(row: any): CarbonGoalProgress {
  const definition: CarbonGoalDefinition & { id: string } = {
    id: row.id,
    title: row.title,
    category: row.category,
    goalType: row.goal_type || row.goalType,
    targetValue: Number(row.target_value ?? row.targetValue),
    unit: row.unit,
    startsOn: row.starts_on || row.startsOn,
    endsOn: row.ends_on || row.endsOn,
    baselineValue: row.baseline_value === null ? null : Number((row.baseline_value ?? row.baselineValue) || 0),
    baselineSource: row.baseline_source || row.baselineSource || null,
    steps: (row.steps || []).map((step: any) => ({ id: step.id, title: step.title, completedAt: step.completed_at || step.completedAt || null, knowledgeSlug: step.knowledge_slug || step.knowledgeSlug || null })),
  };
  if (row.current_value !== undefined || row.currentValue !== undefined) {
    return { ...definition, currentValue: Number(row.current_value ?? row.currentValue), percentComplete: Number(row.percent_complete ?? row.percentComplete), status: row.status };
  }
  return calculateCarbonGoalProgress(definition, []);
}

function normalizeProject(row: any): OffsetProject {
  return {
    id: row.id, provider: 'cloverly', providerProjectId: row.provider_project_id, name: row.name,
    summary: row.summary, country: row.country, technology: row.technology, standard: row.standard,
    registryUrl: row.registry_url, permanence: row.permanence, pricePerTonneMinor: Number(row.price_per_tonne_minor),
    currency: row.currency, imageUrl: row.image_url, active: row.active,
  };
}

function periodStart(period: ImpactSummary['period']): string {
  const date = new Date();
  date.setDate(date.getDate() - (period === 'day' ? 0 : period === 'week' ? 6 : 29));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
