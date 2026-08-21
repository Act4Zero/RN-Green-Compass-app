/* eslint-disable import/first */
const mockFrom = jest.fn();
const mockProcessHabitLog = jest.fn(async (..._args: unknown[]) => ({ success: true }));

jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  default: { from: (...args: unknown[]) => mockFrom(...args) },
}));

jest.mock('@/services/community/pointsService', () => ({
  __esModule: true,
  default: { processHabitLog: (...args: unknown[]) => mockProcessHabitLog(...args) },
}));

import { goalService, habitService } from '../habitService';

describe('habit logging regression', () => {
  it('awards points against the created log without inserting a duplicate log', async () => {
    const insert = jest.fn(() => ({
      select: () => ({ single: async () => ({ data: { id: 'log-123', habit_id: 'habit-1' }, error: null }) }),
    }));
    mockFrom.mockImplementation((table: string) => {
      if (table === 'habits') {
        return { select: () => ({ eq: () => ({ single: async () => ({ data: { estimated_co2_saving: 0.5 }, error: null }) }) }) };
      }
      if (table === 'habit_logs') return { insert };
      throw new Error(`Unexpected table: ${table}`);
    });
    jest.spyOn(goalService, 'updateGoalsForHabitLog').mockResolvedValue(undefined);

    await habitService.logHabit('user-1', 'habit-1', 2, 'Used the train', '2026-08-21');

    expect(insert).toHaveBeenCalledTimes(1);
    expect(mockFrom.mock.calls.filter(([table]) => table === 'habit_logs')).toHaveLength(1);
    expect(mockProcessHabitLog).toHaveBeenCalledWith('user-1', 'habit-1', 'log-123');
  });
});
