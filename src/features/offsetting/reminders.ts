import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import supabase from '@/lib/supabase';
import { offsettingStorage } from './storage';
import type { ReminderPreference } from './types';

const timezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export async function saveSustainabilityReminder(userId: string, preference: Omit<ReminderPreference, 'notificationIds' | 'timezone'>): Promise<ReminderPreference> {
  const current = await offsettingStorage.getReminderPreference(userId);
  await Promise.all((current?.notificationIds || []).map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));

  const notificationIds: string[] = [];
  if (preference.enabled && Platform.OS !== 'web') {
    let permission = await Notifications.getPermissionsAsync();
    if (permission.status !== 'granted') permission = await Notifications.requestPermissionsAsync();
    if (permission.status !== 'granted') throw new Error('Notifications are disabled. You can still use the in-app daily nudge.');
    for (const weekday of preference.weekdays) {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: 'Your sustainable action', body: 'Choose one small action for today and keep your momentum going.', data: { url: '/habits/today' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour: preference.hour, minute: preference.minute },
      });
      notificationIds.push(id);
    }
  }

  const value: ReminderPreference = { ...preference, timezone: timezone(), notificationIds, updatedAt: new Date().toISOString() };
  await offsettingStorage.saveReminderPreference(userId, value);
  try {
    await (supabase as any).from('sustainability_reminder_preferences').upsert({
      user_id: userId, enabled: value.enabled, hour: value.hour, minute: value.minute,
      weekdays: value.weekdays, timezone: value.timezone, updated_at: value.updatedAt,
    }, { onConflict: 'user_id' });
  } catch {
    // Local scheduling is authoritative; the server copy only supports cross-device settings restore.
  }
  return value;
}

export async function getSustainabilityReminder(userId: string): Promise<ReminderPreference | null> {
  const local = await offsettingStorage.getReminderPreference(userId);
  if (local) return local;
  try {
    const { data, error } = await (supabase as any).from('sustainability_reminder_preferences').select('*').eq('user_id', userId).maybeSingle();
    if (error || !data) return null;
    return { enabled: data.enabled, hour: data.hour, minute: data.minute, weekdays: data.weekdays || [], timezone: data.timezone, notificationIds: [], updatedAt: data.updated_at };
  } catch {
    return null;
  }
}
