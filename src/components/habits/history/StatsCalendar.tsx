import { Ionicons } from '@expo/vector-icons';
import { historyStyles } from '@/styles/historyStyles';
import { View, Text, TouchableOpacity } from 'react-native';

const styles = historyStyles;

export function StatsCalendar({
  goToPreviousMonth,
  goToNextMonth,
  currentMonthName,
  currentYearNum,
  currentViewMonth,
  calendarDays,
  handleSelectDate,
  selectedDate
}: {
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  currentMonthName: string;
  currentYearNum: number;
  currentViewMonth: Date;
  calendarDays: { date: string; day: number; activityLevel: 'low' | 'medium' | 'high'; isActive: boolean; isDisabled: boolean; isEmpty: boolean; id: string }[];
  handleSelectDate: (date: string) => void;
  selectedDate: string | null;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={goToPreviousMonth}
            style={styles.calendarNavButton}
          >
            <Ionicons name="chevron-back" size={24} color="#2E7D32" />
          </TouchableOpacity>

          <Text style={styles.calendarHeaderText}>
            {currentMonthName} {currentYearNum}
          </Text>

          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.calendarNavButton}
            disabled={
              currentViewMonth.getMonth() === new Date().getMonth() &&
              currentViewMonth.getFullYear() === new Date().getFullYear()
            }
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={
                currentViewMonth.getMonth() === new Date().getMonth() &&
                currentViewMonth.getFullYear() === new Date().getFullYear()
                  ? "#AAAAAA"
                  : "#2E7D32"
              }
            />
          </TouchableOpacity>
        </View>

        <View style={styles.weekdayHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
            <View key={dayName} style={styles.weekdayItem}>
              <Text style={styles.weekdayText}>{dayName}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarDays.map((day) => (
            <TouchableOpacity
              key={
                day.date ||
                day.id ||
                `empty-${day.day}-${Math.random().toString(36).substring(2, 9)}`
              }
              style={[
                styles.calendarDay,
                day.isActive && styles.calendarDayActive,
                day.isDisabled && styles.calendarDayDisabled,
                day.isActive && day.activityLevel === 'low' && styles.calendarDayLowActivity,
                day.isActive && day.activityLevel === 'medium' && styles.calendarDayMediumActivity,
                day.isActive && day.activityLevel === 'high' && styles.calendarDayHighActivity,
                selectedDate === day.date && { borderWidth: 2, borderColor: '#2E7D32' },
              ]}
              onPress={() => day.isActive ? handleSelectDate(day.date) : null}
              disabled={!day.isActive || day.isEmpty || day.isDisabled}
            >
              <Text
                style={[
                  styles.calendarDayText,
                  day.isActive && styles.calendarDayActiveText,
                  day.isDisabled && styles.calendarDayDisabledText,
                  day.isActive && day.activityLevel === 'high' && { color: '#FFFFFF' },
                ]}
              >
                {day.isEmpty ? '' : day.day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

export default StatsCalendar;