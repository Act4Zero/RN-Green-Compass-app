import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAILY_CHALLENGES } from '../catalog';
import { offsettingService } from '../service';

const mockRpc = jest.fn(async (..._args: unknown[]) => ({ data: null, error: { message: 'not migrated' } }));
const mockUpsert = jest.fn(async (..._args: unknown[]) => ({ error: { message: 'offline' } }));
const mockGetKnowledgeHome = jest.fn(async (..._args: unknown[]) => ({ recommendations: [], interactive: [] }));

jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  default: {
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: () => ({ upsert: (...args: unknown[]) => mockUpsert(...args) }),
  },
}));

jest.mock('@/services/habitService', () => ({
  habitService: {
    calculateTotalActions: jest.fn(async () => 0),
    getHabitLogs: jest.fn(async () => []),
  },
}));

jest.mock('@/features/knowledge', () => ({
  knowledgeService: {
    getKnowledgeHome: (...args: unknown[]) => mockGetKnowledgeHome(...args),
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

describe('offsetting service fallback contracts', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('keeps the daily challenge deterministic and within the learning stage', async () => {
    const first = await offsettingService.getDailyChallenge('user-1', '2026-08-21', 'beginner', ['Zero Waste']);
    const second = await offsettingService.getDailyChallenge('user-1', '2026-08-21', 'beginner', ['Zero Waste']);

    expect(second.challenge.id).toBe(first.challenge.id);
    expect(first.challenge.difficulty).toBe('beginner');
    expect(DAILY_CHALLENGES.some((challenge) => challenge.id === first.challenge.id)).toBe(true);
  });

  it('does not process the same challenge completion twice', async () => {
    const assignment = await offsettingService.getDailyChallenge('user-2', '2026-08-21', 'beginner', []);
    mockRpc.mockClear();

    const completed = await offsettingService.completeDailyChallenge('user-2', assignment);
    const repeated = await offsettingService.completeDailyChallenge('user-2', completed);

    expect(completed.completedAt).toBeTruthy();
    expect(repeated.completedAt).toBe(completed.completedAt);
    expect(mockRpc).toHaveBeenCalledTimes(1);
  });

  it('bounds and privately persists reflection fields without awarding points', async () => {
    const reflection = await offsettingService.saveReflection('user-3', {
      reflectionDate: '2026-08-21',
      didSustainableAction: true,
      actionNote: `  ${'a'.repeat(1100)}  `,
      gratitudeNote: '  Clean air  ',
      journalNote: '  A quieter commute  ',
      updatedAt: '',
    });

    expect(reflection.actionNote).toHaveLength(1000);
    expect(reflection.gratitudeNote).toBe('Clean air');
    expect(reflection.journalNote).toBe('A quieter commute');
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('never recommends learning content above the user progression stage', async () => {
    mockGetKnowledgeHome.mockResolvedValueOnce({
      recommendations: [
        { id: 'beginner', difficulty: 'beginner' },
        { id: 'intermediate', difficulty: 'intermediate' },
        { id: 'advanced', difficulty: 'advanced' },
      ],
      interactive: [],
    } as any);

    const recommendations = await offsettingService.getPersonalizedKnowledge([], [], 'user-4', 'intermediate');
    expect(recommendations.map((item) => item.id)).toEqual(['beginner', 'intermediate']);
  });
});
