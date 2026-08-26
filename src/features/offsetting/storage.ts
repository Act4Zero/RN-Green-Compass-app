import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CarbonActivityEntry, CarbonGoalProgress, DailyChallengeAssignment, DailyReflection, GreenIdentityResult, OffsetContribution, ReminderPreference, TravelEstimate } from './types';

const key = (userId: string, suffix: string) => `green-compass:offsetting:${userId}:${suffix}`;

async function readJson<T>(storageKey: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(storageKey);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

async function writeJson(storageKey: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Remote persistence remains authoritative when device storage is unavailable.
  }
}

export const offsettingStorage = {
  getIdentity: (userId: string) => readJson<GreenIdentityResult>(key(userId, 'identity')),
  saveIdentity: async (userId: string, value: GreenIdentityResult) => { await writeJson(key(userId, 'identity'), value); return value; },
  getAssignment: (userId: string, date: string) => readJson<DailyChallengeAssignment>(key(userId, `challenge:${date}`)),
  saveAssignment: async (userId: string, value: DailyChallengeAssignment) => { await writeJson(key(userId, `challenge:${value.challengeDate}`), value); return value; },
  getReflection: (userId: string, date: string) => readJson<DailyReflection>(key(userId, `reflection:${date}`)),
  saveReflection: async (userId: string, value: DailyReflection) => { await writeJson(key(userId, `reflection:${value.reflectionDate}`), value); return value; },
  getPollResponse: (userId: string, date: string) => readJson<string>(key(userId, `poll:${date}`)),
  savePollResponse: async (userId: string, date: string, optionId: string) => { await writeJson(key(userId, `poll:${date}`), optionId); return optionId; },
  getTravelEntries: async (userId: string) => (await readJson<TravelEstimate[]>(key(userId, 'travel'))) || [],
  saveTravelEntry: async (userId: string, value: TravelEstimate) => {
    const current = (await readJson<TravelEstimate[]>(key(userId, 'travel'))) || [];
    await writeJson(key(userId, 'travel'), [value, ...current].slice(0, 100));
    return value;
  },
  getActivityEntries: async (userId: string) => (await readJson<CarbonActivityEntry[]>(key(userId, 'activities'))) || [],
  saveActivityEntry: async (userId: string, value: CarbonActivityEntry) => {
    const current = (await readJson<CarbonActivityEntry[]>(key(userId, 'activities'))) || [];
    const withoutDuplicate = value.sourceEventId ? current.filter((entry) => entry.sourceEventId !== value.sourceEventId) : current;
    const stored = { ...value, id: value.id || `local-${Date.now()}`, createdAt: value.createdAt || new Date().toISOString() };
    await writeJson(key(userId, 'activities'), [stored, ...withoutDuplicate].slice(0, 500));
    return stored;
  },
  getCarbonGoals: async (userId: string) => (await readJson<CarbonGoalProgress[]>(key(userId, 'carbon-goals'))) || [],
  saveCarbonGoals: async (userId: string, value: CarbonGoalProgress[]) => { await writeJson(key(userId, 'carbon-goals'), value); return value; },
  getOffsetContributions: async (userId: string) => (await readJson<OffsetContribution[]>(key(userId, 'offset-contributions'))) || [],
  saveOffsetContributions: async (userId: string, value: OffsetContribution[]) => { await writeJson(key(userId, 'offset-contributions'), value); return value; },
  getReminderPreference: (userId: string) => readJson<ReminderPreference>(key(userId, 'reminder')),
  saveReminderPreference: async (userId: string, value: ReminderPreference) => { await writeJson(key(userId, 'reminder'), value); return value; },
  getRecommendationHistory: async (userId: string) => (await readJson<string[]>(key(userId, 'recommendation-history'))) || [],
  saveRecommendationHistory: async (userId: string, ids: string[]) => { await writeJson(key(userId, 'recommendation-history'), ids.slice(-20)); return ids; },
};
