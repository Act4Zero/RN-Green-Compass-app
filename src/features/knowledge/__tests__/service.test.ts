import { knowledgeService } from '../service';

jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  default: {
    from: () => ({ select: () => ({ eq: () => ({ limit: async () => ({ data: null, error: { message: 'not migrated' } }) }) }) }),
    rpc: async () => ({ data: null, error: { message: 'not migrated' } }),
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
});
