import supabase from '@/lib/supabase';
import { ALL_DAILY_DOSES, KNOWLEDGE_ITEMS, KNOWLEDGE_QUIZZES, KNOWLEDGE_TOPICS } from './data/catalog';
import { LEARNING_PATHS, SIMULATIONS, TOURS, WEBINARS } from './data/experienceCatalog';
import { INFOGRAPHIC_ITEMS, KNOWLEDGE_BADGES, KNOWLEDGE_CHALLENGES, KNOWLEDGE_LEVELS, KNOWLEDGE_QUESTS, getAvailableQuestNodeIds, getKnowledgeLevel } from './data/v2Catalog';
import { rankKnowledgeItems } from './ranking';
import { knowledgeStorage } from './storage';
import type {
  KnowledgeHomeData,
  KnowledgeItemDetail,
  KnowledgeItemSummary,
  KnowledgeProgress,
  KnowledgeSearchFilters,
  PublicKnowledgeQuiz,
  QuizAttemptResult,
  CertificateVerification,
  KnowledgeDownloadManifest,
  DailyPreference,
  KnowledgeLocale,
  SimulationInputs,
  SimulationResult,
  KnowledgeChallengeAttempt,
  KnowledgeLearningProfile,
  KnowledgePreferences,
  KnowledgeQuestProgress,
  KnowledgeRewardResult,
  KnowledgeWebinarQuestion,
  KnowledgeWebinar,
} from './types';

const isDaily = (type: KnowledgeItemDetail['type']) => type === 'daily_fact' || type === 'daily_quote' || type === 'daily_tip';
const allowDevelopmentWebinarFallback = typeof __DEV__ !== 'undefined' && __DEV__;
const bundledPublishedItems = (locale: string) => [...KNOWLEDGE_ITEMS, ...INFOGRAPHIC_ITEMS].filter((item) => item.locale === locale && (allowDevelopmentWebinarFallback || item.type !== 'webinar'));

async function withKnowledgeTimeout<T>(request: PromiseLike<T>, milliseconds = 1800): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(request),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Knowledge service timeout')), milliseconds); }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const toSummary = ({ body: _body, sources: _sources, searchText: _search, author: _author, reviewer: _reviewer, version: _version, checksum: _checksum, ...summary }: KnowledgeItemDetail): KnowledgeItemSummary => summary;

export const knowledgeService = {
  async getPublishedItems(locale = 'en'): Promise<KnowledgeItemDetail[]> {
    try {
      const { data, error } = await withKnowledgeTimeout<{ data: any; error: any }>((supabase as any).from('published_knowledge_items').select('*').eq('locale', locale).limit(200));
      if (!error && Array.isArray(data) && data.length > 0) {
        const remote = data.map(normalizePublishedRow);
        const remoteSlugs = new Set(remote.map((item: KnowledgeItemDetail) => item.slug));
        return [...remote, ...bundledPublishedItems(locale).filter((item) => !remoteSlugs.has(item.slug))];
      }
    } catch {
      // The built-in reviewed catalog keeps development and offline-first reads usable.
    }
    return bundledPublishedItems(locale);
  },

  async getPublishedKnowledgeItem(slug: string, locale = 'en', userId?: string): Promise<KnowledgeItemDetail | null> {
    const downloads = await knowledgeStorage.getDownloads(userId);
    const offline = downloads.find((item) => item.content.slug === slug);
    const items = await this.getPublishedItems(locale);
    return items.find((item) => item.slug === slug) || offline?.content || null;
  },

  async searchKnowledge(query: string, filters: KnowledgeSearchFilters = {}, locale = 'en', cursor = 0, pageSize = 12) {
    try {
      const { data, error } = await withKnowledgeTimeout<{ data: any; error: any }>((supabase as any).rpc('search_knowledge', {
        p_query: query,
        p_locale: locale,
        p_topic: filters.topic || null,
        p_type: filters.type || null,
        p_difficulty: filters.difficulty || null,
        p_max_minutes: filters.maxMinutes || null,
        p_downloadable: filters.downloadable ?? null,
        p_sort: filters.sort || 'relevance',
        p_offset: cursor,
        p_limit: pageSize + 1,
      }));
      if (!error && Array.isArray(data) && data.length > 0) {
        const hasMore = data.length > pageSize;
        const page = data.slice(0, pageSize).map(normalizePublishedRow).map(toSummary);
        return { items: page, nextCursor: hasMore ? cursor + pageSize : null, total: cursor + page.length + (hasMore ? 1 : 0) };
      }
    } catch {
      // Search the reviewed bootstrap catalog until the remote catalog is available.
    }

    const items = await this.getPublishedItems(locale);
    const normalizedQuery = query.trim().toLowerCase();
    let filtered = items.filter((item) => !isDaily(item.type));
    if (normalizedQuery) filtered = filtered.filter((item) => item.searchText.includes(normalizedQuery) || item.title.toLowerCase().includes(normalizedQuery));
    if (filters.topic) filtered = filtered.filter((item) => item.topicSlugs.includes(filters.topic!));
    if (filters.type) filtered = filtered.filter((item) => item.type === filters.type);
    if (filters.difficulty) filtered = filtered.filter((item) => item.difficulty === filters.difficulty);
    if (filters.maxMinutes) filtered = filtered.filter((item) => item.estimatedMinutes <= filters.maxMinutes!);
    if (filters.downloadable) filtered = filtered.filter((item) => item.downloadable);

    filtered.sort((a, b) => {
      if (filters.sort === 'shortest') return a.estimatedMinutes - b.estimatedMinutes;
      if (filters.sort === 'newest') return b.publishedAt.localeCompare(a.publishedAt);
      if (filters.sort === 'reviewed') return b.reviewedAt.localeCompare(a.reviewedAt);
      if (normalizedQuery) {
        const aExact = a.title.toLowerCase().includes(normalizedQuery) ? 1 : 0;
        const bExact = b.title.toLowerCase().includes(normalizedQuery) ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
      }
      return Number(Boolean(b.editorPick)) - Number(Boolean(a.editorPick)) || a.title.localeCompare(b.title);
    });

    return { items: filtered.slice(cursor, cursor + pageSize).map(toSummary), nextCursor: cursor + pageSize < filtered.length ? cursor + pageSize : null, total: filtered.length };
  },

  async getKnowledgeHome({ locale = 'en', userId, interests = [], activeCategories = [] }: { locale?: KnowledgeLocale; userId?: string; interests?: string[]; activeCategories?: string[] }): Promise<KnowledgeHomeData> {
    if (userId) void this.syncKnowledgeProgress(userId);
    const [items, progress, bookmarks, preferences] = await Promise.all([this.getPublishedItems(locale), knowledgeStorage.getProgress(userId), knowledgeStorage.getBookmarks(userId), this.getPreferences(userId, locale, interests)]);
    const summaries = items.filter((item) => !isDaily(item.type)).map(toSummary);
    const dailyPool = ALL_DAILY_DOSES.filter((item) => item.locale === locale);
    const dailyDose = dailyPool[Math.abs(Math.floor(Date.now() / 86400000)) % dailyPool.length];
    const pathProgressByTopic = Object.fromEntries(LEARNING_PATHS.filter((path) => path.locale === locale).map((path) => [path.topicSlug, Math.round((path.moduleItemIds.filter((id) => progress.some((entry) => entry.itemId === id && entry.completed)).length / path.moduleItemIds.length) * 100)]));
    const recommendations = rankKnowledgeItems(summaries, { interests: preferences.onboardingComplete ? preferences.topicSlugs : interests, activeCategories, bookmarkedItemIds: bookmarks.map((item) => item.itemId), progress, pathProgressByTopic }).slice(0, 8);
    return {
      dailyDose,
      continueLearning: progress.filter((entry) => !entry.completed && entry.percent > 0).map((entry) => ({ ...summaries.find((item) => item.id === entry.itemId)!, progress: entry.percent })).filter((item) => item.id),
      recommendations,
      actionItems: summaries.filter((item) => item.action).slice(0, 6),
      newest: [...summaries].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 6),
      interactive: summaries.filter((item) => ['quiz', 'tour', 'simulation'].includes(item.type)).slice(0, 9),
      live: summaries.filter((item) => item.type === 'webinar').slice(0, 3),
      paths: LEARNING_PATHS.filter((path) => path.locale === locale),
      editorPicks: summaries.filter((item) => item.editorPick).slice(0, 6),
      topics: KNOWLEDGE_TOPICS,
    };
  },

  async setKnowledgeProgress(userId: string | undefined, itemId: string, versionId: string, percent: number, eventId = createEventId()): Promise<KnowledgeProgress> {
    const progress = { itemId, versionId, percent: Math.max(0, Math.min(100, Math.round(percent))), completed: percent >= 100, updatedAt: new Date().toISOString(), eventId };
    if (userId) {
      try {
        const { data, error } = await (supabase as any).rpc('set_knowledge_progress', { p_item_id: itemId, p_version_id: versionId, p_percent: progress.percent, p_event_id: eventId });
        if (!error && data) Object.assign(progress, data);
      } catch {
        // Queue locally when the server or migration is unavailable.
      }
    }
    const saved = await knowledgeStorage.setProgress(userId, progress);
    if (userId && progress.completed) {
      const item = [...KNOWLEDGE_ITEMS, ...INFOGRAPHIC_ITEMS].find((entry) => entry.id === itemId);
      const points = item && ['tour', 'simulation', 'diy'].includes(item.type) ? 10 : item?.type === 'quiz' ? 10 : 5;
      await this.awardKnowledgeReward(userId, `item:${itemId}`, 'item_complete', points);
    }
    return saved;
  },

  async syncKnowledgeProgress(userId: string): Promise<void> {
    const queued = await knowledgeStorage.getProgress(userId);
    await Promise.all(queued.map(async (entry) => {
      try {
        const { error } = await (supabase as any).rpc('set_knowledge_progress', {
          p_item_id: entry.itemId,
          p_version_id: entry.versionId,
          p_percent: entry.percent,
          p_event_id: entry.eventId,
        });
        if (!error && entry.completed) {
          const item = [...KNOWLEDGE_ITEMS, ...INFOGRAPHIC_ITEMS].find((candidate) => candidate.id === entry.itemId);
          const points = item && ['quiz', 'tour', 'simulation', 'diy'].includes(item.type) ? 10 : 5;
          await this.awardKnowledgeReward(userId, `item:${entry.itemId}`, 'item_complete', points);
        }
      } catch {
        // The durable local entry will be retried on the next authenticated Hub visit.
      }
    }));
  },

  async toggleKnowledgeBookmark(userId: string | undefined, itemId: string) {
    const saved = await knowledgeStorage.toggleBookmark(userId, itemId);
    if (userId) {
      try {
        if (saved) await (supabase as any).from('user_knowledge_bookmarks').upsert({ user_id: userId, item_id: itemId });
        else await (supabase as any).from('user_knowledge_bookmarks').delete().eq('user_id', userId).eq('item_id', itemId);
      } catch {
        // The local action remains queued by durable device state.
      }
    }
    return saved;
  },
  getBookmarks: (userId?: string) => knowledgeStorage.getBookmarks(userId),
  getProgress: (userId?: string) => knowledgeStorage.getProgress(userId),
  getDownloads: (userId?: string) => knowledgeStorage.getDownloads(userId),
  async getDownloadManifest(itemId: string, versionId: string, locale = 'en'): Promise<KnowledgeDownloadManifest | null> {
    const item = (await this.getPublishedItems(locale)).find((entry) => entry.id === itemId && entry.versionId === versionId && entry.downloadable);
    return item ? createDownloadManifest(item) : null;
  },
  async downloadItem(userId: string | undefined, item: KnowledgeItemDetail) {
    if (!item.downloadable) throw new Error('This item is not available for offline reading.');
    return knowledgeStorage.saveDownload(userId, { itemId: item.id, versionId: item.versionId, checksum: item.checksum, downloadedAt: new Date().toISOString(), manifest: createDownloadManifest(item), content: item });
  },
  removeDownload: (userId: string | undefined, itemId: string) => knowledgeStorage.removeDownload(userId, itemId),

  async submitFeedback(userId: string | undefined, itemId: string, kind: 'helpful' | 'outdated') {
    analyticsSafeFeedback(itemId, kind);
    try {
      await (supabase as any).from('knowledge_feedback').insert({ user_id: userId || null, item_id: itemId, kind });
    } catch {
      // Feedback is best-effort when the migration is not available locally.
    }
  },

  async getQuiz(itemId: string, locale: KnowledgeLocale = 'en'): Promise<PublicKnowledgeQuiz | null> {
    try {
      const { data, error } = await (supabase as any).rpc('get_public_knowledge_quiz', { p_item_id: itemId });
      if (!error && data && data.id && Array.isArray(data.questions)) return data as PublicKnowledgeQuiz;
    } catch {
      // Use the reviewed bootstrap quiz when the remote catalog is unavailable.
    }
    const candidates = KNOWLEDGE_QUIZZES.filter((entry) => entry.itemId === itemId);
    const quiz = candidates.find((entry) => locale === 'bg' ? entry.id.endsWith('-bg') : !entry.id.endsWith('-bg')) || candidates[0];
    if (!quiz) return null;
    return { ...quiz, questions: quiz.questions.map(({ correctOptionId: _correct, ...question }) => question) };
  },

  async submitQuizAttempt(userId: string | undefined, itemId: string, answers: Record<string, string>, eventId = createEventId(), locale: KnowledgeLocale = 'en'): Promise<QuizAttemptResult> {
    if (userId) {
      try {
        const { data, error } = await (supabase as any).rpc('submit_knowledge_quiz', { p_item_id: itemId, p_answers: answers, p_event_id: eventId });
        if (!error && data) return data as QuizAttemptResult;
      } catch {
        // Local reviewed catalog fallback for development; production scoring is server-authoritative.
      }
    }
    const candidates = KNOWLEDGE_QUIZZES.filter((entry) => entry.itemId === itemId);
    const quiz = candidates.find((entry) => locale === 'bg' ? entry.id.endsWith('-bg') : !entry.id.endsWith('-bg')) || candidates[0];
    if (!quiz) throw new Error('Quiz not found.');
    const feedback = quiz.questions.map((question) => ({ questionId: question.id, correct: answers[question.id] === question.correctOptionId, explanation: question.explanation, sourceId: question.sourceId }));
    const correctAnswers = feedback.filter((entry) => entry.correct).length;
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const result = { attemptId: eventId, score, passed: score >= quiz.passingScore, correctAnswers, totalQuestions: quiz.questions.length, feedback };
    return knowledgeStorage.saveQuizAttempt(userId, result);
  },

  getQuizAttempts: (userId?: string) => knowledgeStorage.getQuizAttempts(userId),

  getTour(itemId: string) {
    return TOURS.find((tour) => tour.itemId === itemId) || null;
  },

  getSimulation(itemId: string) {
    return SIMULATIONS.find((simulation) => simulation.itemId === itemId) || null;
  },

  runSimulation(itemId: string, inputs: SimulationInputs, locale: KnowledgeLocale = 'en'): SimulationResult {
    const simulation = SIMULATIONS.find((entry) => entry.itemId === itemId);
    if (!simulation) throw new Error('Simulation not found.');
    const primary = Math.max(0, inputs.primary);
    const secondary = Math.max(0, Math.min(100, inputs.secondary));
    const tertiary = Math.max(0, Math.min(100, inputs.tertiary));
    let baseline = primary;
    let score = primary;
    let unit = 'impact points';
    if (simulation.kind === 'home-energy') {
      score = primary * (1 - secondary / 100) * (1 - tertiary / 100);
      unit = 'relative energy impact';
    } else if (simulation.kind === 'food-waste') {
      baseline = primary * (secondary / 100);
      score = baseline * (1 - tertiary / 200);
      unit = 'kg avoidable impact';
    } else {
      score = primary * Math.max(0, 1 - secondary / 100 - (tertiary / 100) * 0.7);
      unit = 'relative travel emissions';
    }
    const improvementPercent = baseline > 0 ? Math.max(0, Math.min(100, Math.round((1 - score / baseline) * 100))) : 0;
    return {
      score: Math.round(score * 10) / 10,
      unit,
      baseline: Math.round(baseline * 10) / 10,
      improvementPercent,
      summary: locale === 'bg' ? `Сценарият е с ${improvementPercent}% по-ниско въздействие спрямо базовата стойност.` : `This scenario is ${improvementPercent}% lower impact than the baseline.`,
    };
  },

  getWebinar(itemId: string) {
    return WEBINARS.find((webinar) => webinar.itemId === itemId) || null;
  },

  async getWebinarDetails(itemId: string) {
    try {
      const { data, error } = await (supabase as any).from('knowledge_webinars').select('id,item_id,speaker,speaker_role,starts_at,duration_minutes,timezone,provider,join_url,replay_url,transcript').eq('item_id', itemId).maybeSingle();
      if (!error && data) return normalizeWebinarRow(data);
    } catch {
      // Bundled records are development-only fallbacks.
    }
    return allowDevelopmentWebinarFallback ? this.getWebinar(itemId) : null;
  },

  getWebinars() {
    return allowDevelopmentWebinarFallback ? WEBINARS : [];
  },

  getWebinarRegistrations: (userId?: string) => knowledgeStorage.getWebinarRegistrations(userId),
  async registerForWebinar(userId: string | undefined, webinarId: string, reminderEnabled = true) {
    const registration = { webinarId, registeredAt: new Date().toISOString(), reminderEnabled };
    if (userId) {
      try {
        await (supabase as any).rpc('register_for_knowledge_webinar', { p_webinar_id: webinarId, p_reminder_enabled: reminderEnabled });
      } catch {
        // The durable local registration remains usable offline.
      }
    }
    return knowledgeStorage.saveWebinarRegistration(userId, registration);
  },

  async getPreferences(userId: string | undefined, locale: KnowledgeLocale = 'en', seedInterests: string[] = []): Promise<KnowledgePreferences> {
    if (userId) {
      try {
        const { data, error } = await (supabase as any).from('user_knowledge_preferences').select('locale,topic_slugs,onboarding_complete,updated_at').eq('user_id', userId).maybeSingle();
        if (!error && data) {
          const row = requireRecord(data, 'knowledge preferences');
          const topicSlugs = Array.isArray(row.topic_slugs) && row.topic_slugs.every((value) => typeof value === 'string') ? row.topic_slugs : invalidPayload('knowledge preferences topics');
          const preference: KnowledgePreferences = { locale: row.locale === 'bg' ? 'bg' : 'en', topicSlugs, onboardingComplete: requireBoolean(row.onboarding_complete, 'knowledge preferences onboarding state'), updatedAt: requireString(row.updated_at, 'knowledge preferences timestamp') };
          await knowledgeStorage.setPreferences(userId, preference);
          return preference;
        }
      } catch {
        // Fall back to the durable device preference.
      }
    }
    const local = await knowledgeStorage.getPreferences(userId);
    if (!local.onboardingComplete && local.topicSlugs.length === 0 && seedInterests.length) return { ...local, locale, topicSlugs: seedInterests.filter((slug) => KNOWLEDGE_TOPICS.some((topic) => topic.slug === slug)).slice(0, 3) };
    return { ...local, locale };
  },

  async setPreferences(userId: string | undefined, preference: KnowledgePreferences) {
    const sanitized = { ...preference, topicSlugs: [...new Set(preference.topicSlugs)].filter((slug) => KNOWLEDGE_TOPICS.some((topic) => topic.slug === slug)).slice(0, 5), updatedAt: new Date().toISOString() };
    await knowledgeStorage.setPreferences(userId, sanitized);
    if (userId) {
      try {
        await (supabase as any).from('user_knowledge_preferences').upsert({ user_id: userId, locale: sanitized.locale, topic_slugs: sanitized.topicSlugs, onboarding_complete: sanitized.onboardingComplete, updated_at: sanitized.updatedAt });
      } catch {
        // The local preference will be retried from the Hub.
      }
    }
    return sanitized;
  },

  getChallenges: () => KNOWLEDGE_CHALLENGES,
  getChallenge: (id: string) => KNOWLEDGE_CHALLENGES.find((challenge) => challenge.id === id || challenge.slug === id) || null,
  async getChallengeAttempts(userId?: string) {
    const attempts = await knowledgeStorage.getChallengeAttempts(userId);
    return attempts.map((attempt) => normalizeChallengeAttemptStatus(attempt));
  },
  async startChallenge(userId: string | undefined, challengeId: string, restart = false): Promise<KnowledgeChallengeAttempt> {
    if (!userId) throw new Error('Sign in to start a learning challenge.');
    const challenge = KNOWLEDGE_CHALLENGES.find((entry) => entry.id === challengeId);
    if (!challenge) throw new Error('Challenge not found.');
    const attempts = (await knowledgeStorage.getChallengeAttempts(userId)).map((attempt) => normalizeChallengeAttemptStatus(attempt));
    const active = attempts.find((attempt) => attempt.status === 'active');
    if (active && !restart) {
      if (active.challengeId === challengeId) return active;
      throw new Error('Finish or wait for the active challenge before starting another.');
    }
    try {
      const { data, error } = await (supabase as any).rpc('start_knowledge_challenge', { p_challenge_slug: challenge.slug, p_restart: restart });
      if (!error && data) return knowledgeStorage.saveChallengeAttempt(userId, normalizeChallengeAttemptRow(data));
      if (error && !isUnavailableBackendError(error)) throw new Error(error.message || 'Challenge could not be started.');
    } catch (error) {
      if (!isUnavailableBackendError(error)) throw error;
      // Development and offline fallback below.
    }
    const startedAt = new Date();
    const attempt: KnowledgeChallengeAttempt = { challengeId, attemptId: createEventId(), startedAt: startedAt.toISOString(), deadlineAt: new Date(startedAt.getTime() + challenge.durationDays * 86400000).toISOString(), completedStepIds: [], status: 'active' };
    return knowledgeStorage.saveChallengeAttempt(userId, attempt);
  },
  async completeChallengeStep(userId: string | undefined, challengeId: string, stepId: string): Promise<KnowledgeChallengeAttempt> {
    if (!userId) throw new Error('Sign in to save challenge progress.');
    const challenge = KNOWLEDGE_CHALLENGES.find((entry) => entry.id === challengeId);
    if (!challenge || !challenge.steps.some((entry) => entry.id === stepId)) throw new Error('Challenge step not found.');
    try {
      const { data, error } = await (supabase as any).rpc('complete_knowledge_challenge_step', { p_challenge_slug: challenge.slug, p_step_key: stepId, p_event_id: createEventId() });
      if (!error && data) return knowledgeStorage.saveChallengeAttempt(userId, normalizeChallengeAttemptRow(data));
      if (error && !isUnavailableBackendError(error)) throw new Error(error.message || 'Challenge step was not verified.');
    } catch (error) {
      if (!isUnavailableBackendError(error)) throw error;
      // Offline progress is kept until server validation is available.
    }
    const attempts = await this.getChallengeAttempts(userId);
    const attempt = attempts.find((entry) => entry.challengeId === challengeId && entry.status === 'active');
    if (!attempt) throw new Error('Start this challenge first.');
    const completedStepIds = [...new Set([...attempt.completedStepIds, stepId])];
    const requiredIds = challenge.steps.filter((entry) => entry.required).map((entry) => entry.id);
    const complete = requiredIds.every((id) => completedStepIds.includes(id));
    if (complete) throw new Error('Earlier steps are saved offline. Reconnect to verify the final step and receive the reward.');
    const next: KnowledgeChallengeAttempt = { ...attempt, completedStepIds, status: 'active' };
    await knowledgeStorage.saveChallengeAttempt(userId, next);
    return next;
  },

  getQuests: () => KNOWLEDGE_QUESTS,
  getQuest: (id: string) => KNOWLEDGE_QUESTS.find((quest) => quest.id === id || quest.slug === id) || null,
  getAvailableQuestNodeIds,
  async getQuestProgress(userId: string | undefined, questId: string): Promise<KnowledgeQuestProgress | null> {
    const local = (await knowledgeStorage.getQuestProgress(userId)).find((entry) => entry.questId === questId) || null;
    if (!userId) return local;
    try {
      const { data, error } = await (supabase as any).rpc('get_knowledge_quest_progress', { p_quest_slug: this.getQuest(questId)?.slug || questId });
      if (!error && data) return knowledgeStorage.saveQuestProgress(userId, normalizeQuestProgressRow(data, questId));
      if (error && !isUnavailableBackendError(error)) throw new Error(error.message || 'Quest progress could not be loaded.');
    } catch (error) {
      if (!isUnavailableBackendError(error)) throw error;
      // Use local progress while offline.
    }
    return local;
  },
  async completeQuestNode(userId: string | undefined, questId: string, nodeId: string): Promise<KnowledgeQuestProgress> {
    if (!userId) throw new Error('Sign in to save quest progress.');
    const quest = this.getQuest(questId);
    if (!quest) throw new Error('Quest not found.');
    const node = quest.nodes.find((entry) => entry.id === nodeId);
    if (!node) throw new Error('Quest node not found.');
    const current = await this.getQuestProgress(userId, quest.id) || { questId: quest.id, completedNodeIds: [], startedAt: new Date().toISOString() };
    if (!getAvailableQuestNodeIds(quest, current.completedNodeIds).includes(nodeId)) throw new Error('Complete the prerequisite node first.');
    try {
      const { data, error } = await (supabase as any).rpc('complete_knowledge_quest_node', { p_quest_slug: quest.slug, p_node_key: nodeId, p_event_id: createEventId() });
      if (!error && data) return knowledgeStorage.saveQuestProgress(userId, normalizeQuestProgressRow(data, quest.id));
      if (error && !isUnavailableBackendError(error)) throw new Error(error.message || 'Quest node was not verified.');
    } catch (error) {
      if (!isUnavailableBackendError(error)) throw error;
      // Development fallback below.
    }
    const completedNodeIds = [...new Set([...current.completedNodeIds, nodeId])];
    const core = quest.nodes.filter((entry) => entry.required && !entry.branch);
    const branchComplete = quest.nodes.filter((entry) => entry.required && entry.branch).some((entry) => completedNodeIds.includes(entry.id));
    const complete = core.every((entry) => completedNodeIds.includes(entry.id)) && branchComplete;
    if (complete) throw new Error('Earlier nodes are saved offline. Reconnect to verify the final node and receive the reward.');
    const next: KnowledgeQuestProgress = { ...current, completedNodeIds };
    await knowledgeStorage.saveQuestProgress(userId, next);
    return next;
  },

  async awardKnowledgeReward(userId: string | undefined, referenceId: string, kind: string, points: number): Promise<KnowledgeRewardResult> {
    const boundedPoints = Math.max(0, Math.min(60, Math.round(points)));
    if (userId) {
      try {
        const { data, error } = await (supabase as any).rpc('award_knowledge_reward', { p_reference_id: referenceId, p_kind: kind, p_points: boundedPoints });
        if (!error && data) return normalizeRewardResult(data);
        if (error && !isUnavailableBackendError(error)) throw new Error(error.message || 'Reward eligibility was not verified.');
      } catch (error) {
        if (!isUnavailableBackendError(error)) throw error;
        // Queue an idempotent local event until sync.
      }
    }
    if (!userId) throw new Error('Sign in to earn learning rewards.');
    const inserted = await knowledgeStorage.saveKnowledgeRewardEvent(userId, { referenceId, points: boundedPoints, awardedAt: new Date().toISOString() });
    const events = await knowledgeStorage.getKnowledgeRewardEvents(userId);
    const xp = events.reduce((sum, entry) => sum + entry.points, 0);
    return { awardedPoints: inserted ? boundedPoints : 0, learningXp: xp, level: getKnowledgeLevel(xp), newBadgeCodes: [] };
  },

  async getLearningProfile(userId: string | undefined): Promise<KnowledgeLearningProfile> {
    if (userId) {
      try {
        const { data, error } = await (supabase as any).rpc('get_knowledge_learning_profile');
        if (!error && data) return normalizeLearningProfile(data);
      } catch {
        // Assemble the complete offline profile below.
      }
    }
    const [events, progress, attempts, challengeAttempts, questProgress] = await Promise.all([knowledgeStorage.getKnowledgeRewardEvents(userId), knowledgeStorage.getProgress(userId), knowledgeStorage.getQuizAttempts(userId), this.getChallengeAttempts(userId), knowledgeStorage.getQuestProgress(userId)]);
    const learningXp = events.reduce((sum, entry) => sum + entry.points, 0);
    const level = getKnowledgeLevel(learningXp);
    const nextLevel = KNOWLEDGE_LEVELS.find((entry) => entry.minimumXp > learningXp) || null;
    const completed = progress.filter((entry) => entry.completed);
    const completedIds = new Set(completed.map((entry) => entry.itemId));
    const allItems = [...KNOWLEDGE_ITEMS, ...INFOGRAPHIC_ITEMS];
    const topicProgress = Object.fromEntries(KNOWLEDGE_TOPICS.map((topic) => {
      const topicItems = allItems.filter((item) => item.locale === 'en' && item.topicSlugs.includes(topic.slug) && !isDaily(item.type));
      return [topic.slug, topicItems.length ? Math.round((topicItems.filter((item) => completedIds.has(item.id)).length / topicItems.length) * 100) : 0];
    }));
    const passedQuizzes = attempts.filter((attempt) => attempt.passed).length;
    const interactiveIds = new Set(allItems.filter((item) => ['tour', 'simulation', 'diy'].includes(item.type)).map((item) => item.id));
    const interactiveCount = completed.filter((entry) => interactiveIds.has(entry.itemId)).length;
    const earnedCodes = new Set<string>();
    if (completed.length >= 1) earnedCodes.add('knowledge_first_step');
    if (completed.length >= 5) earnedCodes.add('knowledge_curious_learner');
    if (passedQuizzes >= 3) earnedCodes.add('knowledge_quiz_ace');
    if (interactiveCount >= 3) earnedCodes.add('knowledge_experimenter');
    if (challengeAttempts.some((entry) => entry.status === 'completed')) earnedCodes.add('knowledge_challenge_finisher');
    if (questProgress.some((entry) => entry.completedAt)) earnedCodes.add('knowledge_quest_seeker');
    if (learningXp >= 350) earnedCodes.add('knowledge_green_guru');
    return { learningXp, totalGreenPoints: learningXp, level, nextLevel, completedItems: completed.length, completedQuizzes: passedQuizzes, completedInteractives: interactiveCount, topicProgress, activeChallenge: challengeAttempts.find((entry) => entry.status === 'active') || null, activeQuest: questProgress.find((entry) => !entry.completedAt) || null, badges: KNOWLEDGE_BADGES.map((badge) => ({ ...badge, earned: earnedCodes.has(badge.code) })) };
  },

  async getWebinarQuestions(webinarId: string, userId?: string): Promise<KnowledgeWebinarQuestion[]> {
    try {
      const { data, error } = await (supabase as any).rpc('get_knowledge_webinar_questions', { p_webinar_id: webinarId });
      if (!error && Array.isArray(data)) return data.map(normalizeWebinarQuestionRow);
    } catch {
      // Use local moderated-preview records in development.
    }
    const questions = await knowledgeStorage.getWebinarQuestions(webinarId);
    return questions.filter((question) => ['approved', 'answered'].includes(question.status) || question.userId === userId).sort((a, b) => b.upvotes - a.upvotes || a.createdAt.localeCompare(b.createdAt));
  },
  async submitWebinarQuestion(userId: string | undefined, webinarId: string, body: string): Promise<KnowledgeWebinarQuestion> {
    if (!userId) throw new Error('Sign in to submit a question.');
    const sanitized = body.trim().replace(/\s+/g, ' ').slice(0, 500);
    if (sanitized.length < 10) throw new Error('Write at least 10 characters.');
    try {
      const { data, error } = await (supabase as any).rpc('submit_knowledge_webinar_question', { p_webinar_id: webinarId, p_body: sanitized });
      if (!error && data) return normalizeWebinarQuestionRow(data);
    } catch {
      // Development fallback below.
    }
    return knowledgeStorage.saveWebinarQuestion({ id: createEventId(), webinarId, userId, body: sanitized, status: 'pending', upvotes: 0, viewerHasUpvoted: false, createdAt: new Date().toISOString() });
  },
  async toggleWebinarQuestionVote(userId: string | undefined, question: KnowledgeWebinarQuestion): Promise<KnowledgeWebinarQuestion> {
    if (!userId) throw new Error('Sign in to support a question.');
    try {
      const { data, error } = await (supabase as any).rpc('toggle_knowledge_webinar_question_vote', { p_question_id: question.id });
      if (!error && data) return normalizeWebinarQuestionRow(data);
    } catch {
      // Local fallback below.
    }
    return knowledgeStorage.saveWebinarQuestion({ ...question, viewerHasUpvoted: !question.viewerHasUpvoted, upvotes: Math.max(0, question.upvotes + (question.viewerHasUpvoted ? -1 : 1)) });
  },
  async getWebinarModerationQueue(): Promise<KnowledgeWebinarQuestion[]> {
    try {
      const { data, error } = await (supabase as any).from('knowledge_webinar_questions').select('id,webinar_id,user_id,body,status,answer,replay_timestamp_seconds,created_at').in('status', ['pending', 'approved']).order('created_at');
      if (!error && Array.isArray(data)) return data.map(normalizeWebinarQuestionRow);
    } catch {
      // An unavailable editorial backend yields an empty queue.
    }
    return [];
  },
  async moderateWebinarQuestion(questionId: string, status: 'approved' | 'answered' | 'rejected', answer?: string, replayTimestampSeconds?: number) {
    const update = { status, answer: status === 'answered' ? answer?.trim() || null : null, replay_timestamp_seconds: status === 'answered' ? replayTimestampSeconds ?? null : null, moderated_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { data, error } = await (supabase as any).from('knowledge_webinar_questions').update(update).eq('id', questionId).select().single();
    if (error) throw error;
    return normalizeWebinarQuestionRow(data);
  },

  getLearningPath(slug: string, locale: KnowledgeLocale = 'en') {
    return LEARNING_PATHS.find((path) => path.slug === slug && path.locale === locale) || LEARNING_PATHS.find((path) => path.slug === slug) || null;
  },

  async getLearningPathProgress(userId: string | undefined, slug: string, locale: KnowledgeLocale = 'en') {
    const path = this.getLearningPath(slug, locale);
    if (!path) return null;
    const [progress, attempts] = await Promise.all([knowledgeStorage.getProgress(userId), knowledgeStorage.getQuizAttempts(userId)]);
    const completedModules = path.moduleItemIds.filter((itemId) => progress.some((entry) => entry.itemId === itemId && entry.completed));
    const passedQuizzes = path.requiredQuizItemIds.filter((itemId) => attempts.some((attempt) => attempt.passed && attempt.feedback.some((feedback) => feedback.questionId.startsWith(itemId))));
    const complete = completedModules.length === path.moduleItemIds.length && passedQuizzes.length === path.requiredQuizItemIds.length;
    return { path, completedModules, passedQuizzes, percent: Math.round(((completedModules.length + passedQuizzes.length) / (path.moduleItemIds.length + path.requiredQuizItemIds.length)) * 100), complete };
  },

  async issueCertificate(userId: string | undefined, slug: string, holderName: string, locale: KnowledgeLocale = 'en'): Promise<CertificateVerification> {
    const progress = await this.getLearningPathProgress(userId, slug, locale);
    if (!progress?.complete) throw new Error(locale === 'bg' ? 'Завършете всички модули и задължителни тестове.' : 'Complete every module and required quiz first.');
    const existing = (await knowledgeStorage.getCertificates(userId)).find((entry) => entry.pathTitle === progress.path.title && entry.holderName === holderName);
    if (existing) return existing;
    const code = `GC-${progress.path.id.replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase()}-${createEventId().slice(0, 8).toUpperCase()}`;
    const certificate: CertificateVerification = { code, status: 'valid', pathTitle: progress.path.title, holderName: holderName.trim() || 'Green Compass Learner', issuedAt: new Date().toISOString(), version: 1, accreditationClaim: false };
    let remoteIssued = false;
    if (userId) {
      try {
        const { data, error } = await (supabase as any).rpc('issue_knowledge_certificate', { p_path_slug: progress.path.slug, p_holder_name: certificate.holderName, p_locale: locale });
        const issued = Array.isArray(data) ? data[0] : data;
        if (!error && issued) {
          const row = requireRecord(issued, 'issued certificate');
          Object.assign(certificate, { code: requireString(row.code, 'certificate code'), status: row.status === 'revoked' ? 'revoked' : 'valid', pathTitle: requireString(row.path_title || progress.path.title, 'certificate path title'), holderName: requireString(row.holder_name || certificate.holderName, 'certificate holder'), issuedAt: requireString(row.issued_at, 'certificate issue date'), version: Number(row.version) || 1, accreditationClaim: false });
          remoteIssued = true;
        }
      } catch {
        // Local issuance remains verifiable on this device until the next sync.
      }
    }
    await Promise.all([knowledgeStorage.saveCertificate(userId, certificate), knowledgeStorage.saveCertificate(undefined, certificate)]);
    if (userId && remoteIssued) await this.awardKnowledgeReward(userId, `path:${progress.path.slug}`, 'path_complete', 50);
    return certificate;
  },

  async getCertificates(userId: string | undefined): Promise<CertificateVerification[]> {
    if (userId) {
      try {
        const { data, error } = await (supabase as any).from('knowledge_certificates').select('verification_code,status,holder_name,issued_at,version,knowledge_collections(title)').eq('user_id', userId).order('issued_at', { ascending: false });
        if (!error && Array.isArray(data)) return data.map((value) => {
          const row = requireRecord(value, 'knowledge certificate');
          const collection = requireRecord(row.knowledge_collections, 'knowledge certificate collection');
          return { code: requireString(row.verification_code, 'certificate code'), status: row.status === 'revoked' ? 'revoked' : 'valid', pathTitle: requireString(collection.title, 'certificate path title'), holderName: requireString(row.holder_name || 'Green Compass Learner', 'certificate holder'), issuedAt: requireString(row.issued_at, 'certificate issue date'), version: Number(row.version) || 1, accreditationClaim: false };
        });
        if (error && !isUnavailableBackendError(error)) throw new Error(error.message || 'Certificates could not be loaded.');
      } catch (error) {
        if (!isUnavailableBackendError(error)) throw error;
      }
    }
    return knowledgeStorage.getCertificates(userId);
  },

  async getDailyPreference(userId?: string) {
    if (userId) {
      try {
        const { data, error } = await (supabase as any).from('knowledge_widget_preferences').select('locale,topic_slugs,widget_size').eq('user_id', userId).maybeSingle();
        if (!error && data) {
          const preference: DailyPreference = { locale: data.locale, topicSlugs: data.topic_slugs || [], widgetSize: data.widget_size };
          await knowledgeStorage.setDailyPreference(userId, preference);
          return preference;
        }
      } catch {
        // The shared device preference remains available offline.
      }
    }
    return knowledgeStorage.getDailyPreference(userId);
  },
  async setDailyPreference(userId: string | undefined, preference: DailyPreference) {
    await knowledgeStorage.setDailyPreference(userId, preference);
    if (userId) {
      try {
        await (supabase as any).from('knowledge_widget_preferences').upsert({ user_id: userId, locale: preference.locale, topic_slugs: preference.topicSlugs, widget_size: preference.widgetSize, updated_at: new Date().toISOString() });
      } catch {
        // Retry naturally when the settings screen is opened online again.
      }
    }
    return preference;
  },
  getDailyHistory(locale: KnowledgeLocale = 'en', days = 30, topicSlugs: string[] = [], anchor = new Date()) {
    const localized = ALL_DAILY_DOSES.filter((item) => item.locale === locale);
    const preferred = topicSlugs.length ? localized.filter((item) => item.topicSlugs.some((slug) => topicSlugs.includes(slug))) : localized;
    const pool = preferred.length ? preferred : localized;
    const anchorDay = Math.floor(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()) / 86400000);
    return Array.from({ length: Math.max(1, Math.min(days, 90)) }, (_, offset) => ({
      date: new Date((anchorDay - offset) * 86400000).toISOString().slice(0, 10),
      item: pool[Math.abs(anchorDay - offset) % pool.length],
    }));
  },

  async verifyCertificate(code: string): Promise<CertificateVerification | null> {
    try {
      const { data, error } = await (supabase as any).rpc('verify_knowledge_certificate', { p_code: code });
      const row = Array.isArray(data) ? data[0] : data;
      if (!error && row) return { code: row.code, status: row.status, pathTitle: row.path_title, holderName: row.holder_name, issuedAt: row.issued_at, version: row.version, accreditationClaim: false };
    } catch {
      // Continue with the local public record below.
    }
    const local = await knowledgeStorage.getCertificates(undefined);
    return local.find((entry) => entry.code === code) || null;
  },
};

function createEventId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function analyticsSafeFeedback(_itemId: string, _kind: 'helpful' | 'outdated') {
  // Intentional seam for a native analytics adapter; no free-form content is stored.
}

function createDownloadManifest(item: KnowledgeItemDetail): KnowledgeDownloadManifest {
  const serialized = JSON.stringify(item);
  return {
    itemId: item.id,
    versionId: item.versionId,
    checksum: item.checksum,
    estimatedBytes: serialized.length * 2,
    mediaFiles: item.body.filter((block) => block.type === 'download').map((block) => ({ blockId: block.id, title: block.title, sizeLabel: block.sizeLabel })),
  };
}

function normalizePublishedRow(row: any): KnowledgeItemDetail {
  requireRecord(row, 'published knowledge item');
  requireString(row.id, 'published knowledge item id');
  requireString(row.slug, 'published knowledge item slug');
  requireString(row.title, 'published knowledge item title');
  if (!Array.isArray(row.body_blocks) || !Array.isArray(row.sources)) invalidPayload('published knowledge item content');
  return {
    id: row.id,
    versionId: row.version_id,
    slug: row.slug,
    locale: row.locale || 'en',
    type: row.type,
    title: row.title,
    summary: row.summary,
    topicSlugs: row.topic_slugs || [],
    difficulty: row.difficulty,
    estimatedMinutes: row.estimated_minutes,
    publishedAt: row.published_at,
    reviewedAt: row.reviewed_at,
    nextReviewAt: row.next_review_at,
    downloadable: row.downloadable,
    editorPick: row.editor_pick,
    action: row.action || undefined,
    visual: row.visual || undefined,
    author: row.author,
    reviewer: row.reviewer,
    body: row.body_blocks || [],
    sources: row.sources || [],
    searchText: row.search_text || '',
    version: row.version,
    checksum: row.checksum,
  };
}

function normalizeChallengeAttemptStatus(attempt: KnowledgeChallengeAttempt, now = new Date()): KnowledgeChallengeAttempt {
  if (attempt.status === 'active' && new Date(attempt.deadlineAt) < now) return { ...attempt, status: 'expired' };
  return attempt;
}

function normalizeChallengeAttemptRow(row: any): KnowledgeChallengeAttempt {
  requireRecord(row, 'challenge attempt');
  const completedStepIds = row.completedStepIds || row.completed_step_ids || [];
  if (!Array.isArray(completedStepIds) || !completedStepIds.every((value: unknown) => typeof value === 'string')) invalidPayload('challenge completed steps');
  const status = row.status;
  if (!['active', 'completed', 'expired'].includes(status)) invalidPayload('challenge status');
  return normalizeChallengeAttemptStatus({
    challengeId: requireString(row.challengeId || row.challenge_id || row.challenge?.id, 'challenge id'),
    attemptId: requireString(row.attemptId || row.attempt_id || row.id, 'challenge attempt id'),
    startedAt: requireString(row.startedAt || row.started_at, 'challenge start'),
    deadlineAt: requireString(row.deadlineAt || row.deadline_at, 'challenge deadline'),
    completedStepIds,
    status,
    completedAt: row.completedAt || row.completed_at || undefined,
  });
}

function normalizeQuestProgressRow(row: any, fallbackQuestId: string): KnowledgeQuestProgress {
  requireRecord(row, 'quest progress');
  const completedNodeIds = row.completedNodeIds || row.completed_node_ids || [];
  if (!Array.isArray(completedNodeIds) || !completedNodeIds.every((value: unknown) => typeof value === 'string')) invalidPayload('quest completed nodes');
  return {
    questId: requireString(row.questId || row.quest_id || fallbackQuestId, 'quest id'),
    completedNodeIds,
    startedAt: row.startedAt || row.started_at || new Date().toISOString(),
    completedAt: row.completedAt || row.completed_at || undefined,
  };
}

function normalizeRewardResult(row: any): KnowledgeRewardResult {
  requireRecord(row, 'knowledge reward');
  const xp = Number(row.learningXp ?? row.learning_xp ?? 0);
  const awardedPoints = Number(row.awardedPoints ?? row.awarded_points ?? 0);
  if (!Number.isFinite(xp) || !Number.isFinite(awardedPoints)) invalidPayload('knowledge reward totals');
  const newBadgeCodes = row.newBadgeCodes || row.new_badge_codes || [];
  if (!Array.isArray(newBadgeCodes) || !newBadgeCodes.every((value: unknown) => typeof value === 'string')) invalidPayload('knowledge reward badges');
  return {
    awardedPoints,
    learningXp: xp,
    level: getKnowledgeLevel(xp),
    newBadgeCodes,
  };
}

function normalizeLearningProfile(row: any): KnowledgeLearningProfile {
  requireRecord(row, 'knowledge learning profile');
  const xp = Number(row.learningXp ?? row.learning_xp ?? 0);
  if (!Number.isFinite(xp)) invalidPayload('knowledge learning XP');
  const badgeCodes = row.badgeCodes || row.badge_codes || [];
  if (!Array.isArray(badgeCodes) || !badgeCodes.every((value: unknown) => typeof value === 'string')) invalidPayload('knowledge profile badges');
  const earned = new Set<string>(badgeCodes);
  const challenge = row.activeChallenge || row.active_challenge;
  const quest = row.activeQuest || row.active_quest;
  return {
    learningXp: xp,
    totalGreenPoints: Number(row.totalGreenPoints ?? row.total_green_points ?? xp),
    level: getKnowledgeLevel(xp),
    nextLevel: KNOWLEDGE_LEVELS.find((entry) => entry.minimumXp > xp) || null,
    completedItems: Number(row.completedItems ?? row.completed_items ?? 0),
    completedQuizzes: Number(row.completedQuizzes ?? row.completed_quizzes ?? 0),
    completedInteractives: Number(row.completedInteractives ?? row.completed_interactives ?? 0),
    topicProgress: row.topicProgress || row.topic_progress || {},
    activeChallenge: challenge ? normalizeChallengeAttemptRow(challenge) : null,
    activeQuest: quest ? normalizeQuestProgressRow(quest, quest.questId || quest.quest_id) : null,
    badges: KNOWLEDGE_BADGES.map((badge) => ({ ...badge, earned: earned.has(badge.code) })),
  };
}

function normalizeWebinarQuestionRow(row: any): KnowledgeWebinarQuestion {
  requireRecord(row, 'webinar question');
  const status = requireString(row.status, 'webinar question status');
  if (!['pending', 'approved', 'answered', 'rejected'].includes(status)) invalidPayload('webinar question status');
  return {
    id: requireString(row.id, 'webinar question id'),
    webinarId: requireString(row.webinarId || row.webinar_id, 'webinar question webinar id'),
    userId: row.userId || row.user_id || undefined,
    body: requireString(row.body, 'webinar question body'),
    status: status as KnowledgeWebinarQuestion['status'],
    upvotes: Number(row.upvotes || 0),
    viewerHasUpvoted: Boolean(row.viewerHasUpvoted ?? row.viewer_has_upvoted),
    answer: row.answer || undefined,
    replayTimestampSeconds: row.replayTimestampSeconds ?? row.replay_timestamp_seconds ?? undefined,
    createdAt: requireString(row.createdAt || row.created_at, 'webinar question timestamp'),
  };
}

function normalizeWebinarRow(row: any): KnowledgeWebinar {
  requireRecord(row, 'knowledge webinar');
  const provider = requireString(row.provider, 'webinar provider');
  if (!['youtube', 'zoom', 'vimeo'].includes(provider)) invalidPayload('webinar provider');
  const durationMinutes = Number(row.duration_minutes);
  if (!Number.isFinite(durationMinutes) || durationMinutes < 10 || durationMinutes > 480) invalidPayload('webinar duration');
  return {
    id: requireString(row.id, 'webinar id'), itemId: requireString(row.item_id, 'webinar item id'),
    speaker: requireString(row.speaker, 'webinar speaker'), speakerRole: requireString(row.speaker_role, 'webinar speaker role'),
    startsAt: requireString(row.starts_at, 'webinar start'), durationMinutes, timezone: requireString(row.timezone, 'webinar timezone'),
    provider: provider as KnowledgeWebinar['provider'], joinUrl: requireHttps(row.join_url, 'webinar URL'),
    replayUrl: row.replay_url ? requireHttps(row.replay_url, 'webinar replay URL') : undefined,
    transcript: typeof row.transcript === 'string' ? row.transcript : undefined,
  };
}

function requireRecord(value: unknown, label: string): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalidPayload(label);
  return value as Record<string, any>;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') invalidPayload(label);
  return value as string;
}

function requireBoolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') invalidPayload(label);
  return value as boolean;
}

function requireHttps(value: unknown, label: string): string {
  const result = requireString(value, label);
  if (!result.startsWith('https://')) invalidPayload(label);
  return result;
}

function invalidPayload(label: string): never {
  throw new Error(`Invalid ${label} payload.`);
}

function isUnavailableBackendError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const record = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  const code = String(record.code || '').toUpperCase();
  const message = String(record.message || error || '').toLowerCase();
  return ['PGRST202', 'PGRST205', '404'].includes(code) || /not migrated|could not find the function|failed to fetch|network request failed|service timeout|fetch failed/.test(message);
}
