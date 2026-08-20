import supabase from '@/lib/supabase';
import { ALL_DAILY_DOSES, KNOWLEDGE_ITEMS, KNOWLEDGE_QUIZZES, KNOWLEDGE_TOPICS } from './data/catalog';
import { LEARNING_PATHS, SIMULATIONS, TOURS, WEBINARS } from './data/experienceCatalog';
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
} from './types';

const isDaily = (type: KnowledgeItemDetail['type']) => type === 'daily_fact' || type === 'daily_quote' || type === 'daily_tip';

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
        return [...remote, ...KNOWLEDGE_ITEMS.filter((item) => item.locale === locale && !remoteSlugs.has(item.slug))];
      }
    } catch {
      // The built-in reviewed catalog keeps development and offline-first reads usable.
    }
    return KNOWLEDGE_ITEMS.filter((item) => item.locale === locale);
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

  async getKnowledgeHome({ locale = 'en', userId, interests = [], activeCategories = [] }: { locale?: string; userId?: string; interests?: string[]; activeCategories?: string[] }): Promise<KnowledgeHomeData> {
    if (userId) void this.syncKnowledgeProgress(userId);
    const [items, progress, bookmarks] = await Promise.all([this.getPublishedItems(locale), knowledgeStorage.getProgress(userId), knowledgeStorage.getBookmarks(userId)]);
    const summaries = items.filter((item) => !isDaily(item.type)).map(toSummary);
    const dailyPool = ALL_DAILY_DOSES.filter((item) => item.locale === locale);
    const dailyDose = dailyPool[Math.abs(Math.floor(Date.now() / 86400000)) % dailyPool.length];
    const recommendations = rankKnowledgeItems(summaries, { interests, activeCategories, bookmarkedItemIds: bookmarks.map((item) => item.itemId), progress }).slice(0, 8);
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
    return knowledgeStorage.setProgress(userId, progress);
  },

  async syncKnowledgeProgress(userId: string): Promise<void> {
    const queued = await knowledgeStorage.getProgress(userId);
    await Promise.all(queued.map(async (entry) => {
      try {
        await (supabase as any).rpc('set_knowledge_progress', {
          p_item_id: entry.itemId,
          p_version_id: entry.versionId,
          p_percent: entry.percent,
          p_event_id: entry.eventId,
        });
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

  getWebinars() {
    return WEBINARS;
  },

  getWebinarRegistrations: (userId?: string) => knowledgeStorage.getWebinarRegistrations(userId),
  async registerForWebinar(userId: string | undefined, webinarId: string, reminderEnabled = true) {
    const webinar = WEBINARS.find((entry) => entry.id === webinarId);
    if (!webinar) throw new Error('Webinar not found.');
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
    if (userId) {
      try {
        const { data, error } = await (supabase as any).rpc('issue_knowledge_certificate', { p_path_slug: progress.path.slug, p_holder_name: certificate.holderName, p_locale: locale });
        if (!error && data?.code) Object.assign(certificate, data, { accreditationClaim: false });
      } catch {
        // Local issuance remains verifiable on this device until the next sync.
      }
    }
    await Promise.all([knowledgeStorage.saveCertificate(userId, certificate), knowledgeStorage.saveCertificate(undefined, certificate)]);
    return certificate;
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
