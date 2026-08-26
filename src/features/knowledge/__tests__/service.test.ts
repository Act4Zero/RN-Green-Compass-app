import { knowledgeService } from '../service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockRpc: jest.Mock = jest.fn(async () => ({ data: null, error: { message: 'not migrated' } }));

jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  default: {
    from: () => ({ select: () => ({ eq: () => ({ limit: async () => ({ data: null, error: { message: 'not migrated' } }) }) }) }),
    rpc: () => mockRpc(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  let values: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => values[key] ?? null),
      setItem: jest.fn(async (key: string, value: string) => { values[key] = value; }),
      removeItem: jest.fn(async (key: string) => { delete values[key]; }),
      clear: jest.fn(async () => { values = {}; }),
    },
  };
});

describe('Knowledge Hub service contracts', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockRpc.mockReset();
    mockRpc.mockResolvedValue({ data: null, error: { message: 'not migrated' } });
  });

  it('searches and filters the reviewed fallback catalog', async () => {
    const result = await knowledgeService.searchKnowledge('energy', { topic: 'clean-energy' });
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((item) => item.topicSlugs.includes('clean-energy'))).toBe(true);
  });

  it('never exposes correct answer identifiers through the public quiz contract', async () => {
    const quiz = await knowledgeService.getQuiz('climate-action-basics-quiz');
    expect(quiz).not.toBeNull();
    expect(quiz!.questions.every((question) => !('correctOptionId' in question))).toBe(true);
  });

  it('calculates fallback quiz results with the configured pass threshold', async () => {
    const quiz = await knowledgeService.getQuiz('climate-action-basics-quiz');
    const answers = Object.fromEntries(quiz!.questions.map((question, index) => [question.id, index === 0 ? 'b' : index === 1 ? 'b' : index === 4 ? 'c' : 'a']));
    const result = await knowledgeService.submitQuizAttempt(undefined, 'climate-action-basics-quiz', answers, 'attempt-test');
    expect(result.score).toBe(80);
    expect(result.passed).toBe(true);
    expect(result.attemptId).toBe('attempt-test');
  });

  it('sanitizes preferences to five valid unique topics', async () => {
    const saved = await knowledgeService.setPreferences('learner-1', {
      locale: 'bg', onboardingComplete: true, updatedAt: '',
      topicSlugs: ['zero-waste', 'clean-energy', 'zero-waste', 'sustainable-food', 'ethical-fashion', 'conservation', 'not-a-topic'],
    });
    expect(saved.topicSlugs).toEqual(['zero-waste', 'clean-energy', 'sustainable-food', 'ethical-fashion', 'conservation']);
  });

  it('keeps local reward retries idempotent and requires sign-in', async () => {
    await expect(knowledgeService.awardKnowledgeReward(undefined, 'item:test', 'item_complete', 5)).rejects.toThrow(/sign in/i);
    const first = await knowledgeService.awardKnowledgeReward('learner-1', 'item:test', 'item_complete', 5);
    const retry = await knowledgeService.awardKnowledgeReward('learner-1', 'item:test', 'item_complete', 5);
    expect(first.awardedPoints).toBe(5);
    expect(retry.awardedPoints).toBe(0);
    expect(retry.learningXp).toBe(5);
  });

  it('does not convert an authoritative reward rejection into an offline reward', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { code: 'P0001', message: 'Reward eligibility not verified' } });
    await expect(knowledgeService.awardKnowledgeReward('learner-1', 'quest:not-complete', 'quest_complete', 50)).rejects.toThrow(/eligibility/i);
    const profile = await knowledgeService.getLearningProfile(undefined);
    expect(profile.learningXp).toBe(0);
  });

  it('calculates the challenge deadline from the start instant', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-26T12:00:00.000Z'));
    const attempt = await knowledgeService.startChallenge('learner-1', 'challenge-climate-3');
    expect(attempt.startedAt).toBe('2026-08-26T12:00:00.000Z');
    expect(attempt.deadlineAt).toBe('2026-08-29T12:00:00.000Z');
    jest.useRealTimers();
  });
});
