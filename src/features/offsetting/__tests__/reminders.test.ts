import { saveSustainabilityReminder } from '../reminders';

const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockScheduleNotificationAsync = jest.fn();
const mockCancelScheduledNotificationAsync = jest.fn();

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissionsAsync(...args),
  scheduleNotificationAsync: (...args: unknown[]) => mockScheduleNotificationAsync(...args),
  cancelScheduledNotificationAsync: (...args: unknown[]) => mockCancelScheduledNotificationAsync(...args),
  SchedulableTriggerInputTypes: { WEEKLY: 'weekly' },
}));

jest.mock('@/lib/supabase', () => ({ __esModule: true, default: { from: () => ({ upsert: jest.fn(async () => ({ error: null })) }) } }));

jest.mock('@react-native-async-storage/async-storage', () => {
  const values: Record<string, string> = {};
  return { __esModule: true, default: {
    getItem: jest.fn(async (key: string) => values[key] || null),
    setItem: jest.fn(async (key: string, value: string) => { values[key] = value; }),
  } };
});

describe('local sustainability reminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockScheduleNotificationAsync.mockResolvedValueOnce('notification-1').mockResolvedValueOnce('notification-2');
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
  });

  it('schedules one local weekly notification per selected weekday', async () => {
    const result = await saveSustainabilityReminder('reminder-user', { enabled: true, hour: 9, minute: 15, weekdays: [2, 5] });
    expect(result.notificationIds).toEqual(['notification-1', 'notification-2']);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(2);
    expect(mockScheduleNotificationAsync.mock.calls[0][0].content.data.url).toBe('/habits/today');
  });

  it('fails gracefully when the user denies notification permission', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });
    await expect(saveSustainabilityReminder('denied-user', { enabled: true, hour: 9, minute: 0, weekdays: [2] })).rejects.toThrow('disabled');
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
