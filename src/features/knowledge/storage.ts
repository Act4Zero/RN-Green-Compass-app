import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CertificateVerification, DailyPreference, KnowledgeBookmark, KnowledgeChallengeAttempt, KnowledgeDownload, KnowledgePreferences, KnowledgeProgress, KnowledgeQuestProgress, KnowledgeWebinarQuestion, KnowledgeWebinarRegistration, QuizAttemptResult } from './types';

const key = (userId: string | undefined, suffix: string) => `green-compass:knowledge:${userId || 'guest'}:${suffix}`;

async function readArray<T>(storageKey: string): Promise<T[]> {
  try {
    const value = await AsyncStorage.getItem(storageKey);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

async function writeArray<T>(storageKey: string, value: T[]) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(value));
}

export const knowledgeStorage = {
  getProgress: (userId?: string) => readArray<KnowledgeProgress>(key(userId, 'progress')),
  async setProgress(userId: string | undefined, progress: KnowledgeProgress) {
    const entries = await this.getProgress(userId);
    const next = [...entries.filter((entry) => entry.itemId !== progress.itemId), progress];
    await writeArray(key(userId, 'progress'), next);
    return progress;
  },
  getBookmarks: (userId?: string) => readArray<KnowledgeBookmark>(key(userId, 'bookmarks')),
  async toggleBookmark(userId: string | undefined, itemId: string) {
    const entries = await this.getBookmarks(userId);
    const existing = entries.some((entry) => entry.itemId === itemId);
    const next = existing ? entries.filter((entry) => entry.itemId !== itemId) : [...entries, { itemId, createdAt: new Date().toISOString() }];
    await writeArray(key(userId, 'bookmarks'), next);
    return !existing;
  },
  getDownloads: (userId?: string) => readArray<KnowledgeDownload>(key(userId, 'downloads')),
  async saveDownload(userId: string | undefined, download: KnowledgeDownload) {
    const entries = await this.getDownloads(userId);
    const next = [...entries.filter((entry) => entry.itemId !== download.itemId), download];
    await writeArray(key(userId, 'downloads'), next);
    return download;
  },
  async removeDownload(userId: string | undefined, itemId: string) {
    const entries = await this.getDownloads(userId);
    await writeArray(key(userId, 'downloads'), entries.filter((entry) => entry.itemId !== itemId));
  },
  getQuizAttempts: (userId?: string) => readArray<QuizAttemptResult>(key(userId, 'quiz-attempts')),
  async saveQuizAttempt(userId: string | undefined, attempt: QuizAttemptResult) {
    const entries = await this.getQuizAttempts(userId);
    await writeArray(key(userId, 'quiz-attempts'), [...entries, attempt].slice(-100));
    return attempt;
  },
  getWebinarRegistrations: (userId?: string) => readArray<KnowledgeWebinarRegistration>(key(userId, 'webinar-registrations')),
  async saveWebinarRegistration(userId: string | undefined, registration: KnowledgeWebinarRegistration) {
    const entries = await this.getWebinarRegistrations(userId);
    const next = [...entries.filter((entry) => entry.webinarId !== registration.webinarId), registration];
    await writeArray(key(userId, 'webinar-registrations'), next);
    return registration;
  },
  getCertificates: (userId?: string) => readArray<CertificateVerification>(key(userId, 'certificates')),
  async saveCertificate(userId: string | undefined, certificate: CertificateVerification) {
    const entries = await this.getCertificates(userId);
    const next = [...entries.filter((entry) => entry.code !== certificate.code), certificate];
    await writeArray(key(userId, 'certificates'), next);
    return certificate;
  },
  async getDailyPreference(userId?: string): Promise<DailyPreference> {
    try {
      const value = await AsyncStorage.getItem(key(userId, 'daily-preference'));
      return value ? JSON.parse(value) : { locale: 'en', topicSlugs: [], widgetSize: 'small' };
    } catch {
      return { locale: 'en', topicSlugs: [], widgetSize: 'small' };
    }
  },
  async setDailyPreference(userId: string | undefined, preference: DailyPreference) {
    await AsyncStorage.setItem(key(userId, 'daily-preference'), JSON.stringify(preference));
    return preference;
  },
  async getPreferences(userId?: string): Promise<KnowledgePreferences> {
    try {
      const value = await AsyncStorage.getItem(key(userId, 'preferences-v2'));
      return value ? JSON.parse(value) : { locale: 'en', topicSlugs: [], onboardingComplete: false, updatedAt: new Date(0).toISOString() };
    } catch {
      return { locale: 'en', topicSlugs: [], onboardingComplete: false, updatedAt: new Date(0).toISOString() };
    }
  },
  async setPreferences(userId: string | undefined, preference: KnowledgePreferences) {
    await AsyncStorage.setItem(key(userId, 'preferences-v2'), JSON.stringify(preference));
    return preference;
  },
  getChallengeAttempts: (userId?: string) => readArray<KnowledgeChallengeAttempt>(key(userId, 'challenge-attempts-v2')),
  async saveChallengeAttempt(userId: string | undefined, attempt: KnowledgeChallengeAttempt) {
    const entries = await this.getChallengeAttempts(userId);
    await writeArray(key(userId, 'challenge-attempts-v2'), [...entries.filter((entry) => entry.attemptId !== attempt.attemptId), attempt].slice(-40));
    return attempt;
  },
  getQuestProgress: (userId?: string) => readArray<KnowledgeQuestProgress>(key(userId, 'quest-progress-v2')),
  async saveQuestProgress(userId: string | undefined, progress: KnowledgeQuestProgress) {
    const entries = await this.getQuestProgress(userId);
    await writeArray(key(userId, 'quest-progress-v2'), [...entries.filter((entry) => entry.questId !== progress.questId), progress]);
    return progress;
  },
  getKnowledgeRewardEvents: (userId?: string) => readArray<{ referenceId: string; points: number; awardedAt: string }>(key(userId, 'reward-events-v2')),
  async saveKnowledgeRewardEvent(userId: string | undefined, event: { referenceId: string; points: number; awardedAt: string }) {
    const entries = await this.getKnowledgeRewardEvents(userId);
    if (entries.some((entry) => entry.referenceId === event.referenceId)) return false;
    await writeArray(key(userId, 'reward-events-v2'), [...entries, event].slice(-500));
    return true;
  },
  getWebinarQuestions: (webinarId: string) => readArray<KnowledgeWebinarQuestion>(`green-compass:knowledge:webinar:${webinarId}:questions-v2`),
  async saveWebinarQuestion(question: KnowledgeWebinarQuestion) {
    const storageKey = `green-compass:knowledge:webinar:${question.webinarId}:questions-v2`;
    const entries = await readArray<KnowledgeWebinarQuestion>(storageKey);
    await writeArray(storageKey, [...entries.filter((entry) => entry.id !== question.id), question]);
    return question;
  },
};
