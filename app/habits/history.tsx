import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useHabitStats from '../hooks/useHabitStats';
import HabitContextModule from '../context/HabitContext/HabitContext';
import { useAuth } from '../context/AuthContext';

const { useHabit } = HabitContextModule;
import { HabitLog, UserGoal } from '../types/supabase';

interface Styles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  statsContainer: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  section: ViewStyle;
  sectionHeader: ViewStyle;
  sectionTitle: TextStyle;
  actionCountBadge: ViewStyle;
  actionCountText: TextStyle;
  filtersContainer: ViewStyle;
  filterButton: ViewStyle;
  filterButtonActive: ViewStyle;
  filterText: TextStyle;
  filterTextActive: TextStyle;
  calendarContainer: ViewStyle;
  calendarHeader: ViewStyle;
  calendarHeaderText: TextStyle;
  calendarNavButton: ViewStyle;
  weekdayHeader: ViewStyle;
  weekdayItem: ViewStyle;
  weekdayText: TextStyle;
  calendarGrid: ViewStyle;
  calendarDay: ViewStyle;
  calendarDayText: TextStyle;
  calendarDayActive: ViewStyle;
  calendarDayActiveText: TextStyle;
  calendarDayDisabled: ViewStyle;
  calendarDayDisabledText: TextStyle;
  calendarDayLowActivity: ViewStyle;
  calendarDayMediumActivity: ViewStyle;
  calendarDayHighActivity: ViewStyle;
  logContainer: ViewStyle;
  logItem: ViewStyle;
  logHeader: ViewStyle;
  logDate: TextStyle;
  logTitle: TextStyle;
  logDescription: TextStyle;
  logDetails: ViewStyle;
  logQuantity: TextStyle;
  logCO2: TextStyle;
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
  completedGoalItem: ViewStyle;
  completedGoalHeader: ViewStyle;
  completedGoalTitle: TextStyle;
  completedGoalCategory: TextStyle;
  completedGoalProgress: ViewStyle;
  completedGoalProgressText: TextStyle;
}

// Empty arrays that will be populated with real data from the database
const emptyDates: string[] = [];
const emptyLogs: HabitLog[] = [];

// Default categories based on habits_rows.csv
const defaultCategories: Record<string, string> = {
  'all': 'All',
  'Mobility': 'Mobility',
  'Food': 'Food',
  'Household Activities': 'Household',
  'Heating': 'Heating',
};

export default function HabitHistory() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { user } = useAuth();
  const { 
    totalCO2Saved, 
    totalActions, 
    overallStreak,
    getDatesWithCompletedHabits,
    getLogsGroupedByDate
  } = useHabitStats();
  
  const { habitLogs, habits, userGoals } = useHabit();
  
  // State for completed goals
  const [completedGoals, setCompletedGoals] = useState<UserGoal[]>([]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredLogs, setFilteredLogs] = useState<HabitLog[]>([]);
  
  // Use real data from the hooks instead of mock data
  const [activeDates, setActiveDates] = useState<string[]>(emptyDates);
  const [logs, setLogs] = useState<HabitLog[]>(habitLogs || emptyLogs);
  
  // State for calendar navigation
  const [currentViewMonth, setCurrentViewMonth] = useState<Date>(new Date());
  const [registrationDate, setRegistrationDate] = useState<Date | null>(null);

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentViewMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    
    // Don't go before registration date
    if (registrationDate && prevMonth >= registrationDate) {
      setCurrentViewMonth(prevMonth);
    } else if (registrationDate) {
      // Set to registration month if trying to go before it
      setCurrentViewMonth(new Date(registrationDate));
    }
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentViewMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Don't go beyond current month
    const today = new Date();
    if (nextMonth.getFullYear() < today.getFullYear() || 
        (nextMonth.getFullYear() === today.getFullYear() && 
         nextMonth.getMonth() <= today.getMonth())) {
      setCurrentViewMonth(nextMonth);
    }
  };
  
  // Get activity level for a specific date
  const getActivityLevel = (dateString: string) => {
    // Count the number of logs for this date
    const logsForDate = logs.filter(log => log.log_date === dateString);
    const count = logsForDate.length;
    
    if (count === 0) return 'none';
    if (count <= 2) return 'low';
    if (count <= 5) return 'medium';
    return 'high';
  };
  
  // Generate calendar days for the current view month
  const generateCalendarDays = () => {
    const year = currentViewMonth.getFullYear();
    const month = currentViewMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty spaces for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: '', day: 0, isActive: false, isEmpty: true });
    }
    
    // Add the days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split('T')[0];
      
      // Check if this date is before registration date
      const isBeforeRegistration = registrationDate && date < registrationDate;
      
      // Check if this date is in the future
      const isInFuture = date > currentDate;
      // Get activity level for this date
      const activityLevel = getActivityLevel(dateString);
      
      days.push({
        date: dateString,
        day: i,
        isActive: activeDates.includes(dateString) && !isBeforeRegistration && !isInFuture,
        isEmpty: false,
        isDisabled: isBeforeRegistration || isInFuture,
        activityLevel
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Set today as the default selected date
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    
    // Get user registration date if available
    if (user) {
      // Use user.created_at as the registration date
      const regDate = user.created_at ? new Date(user.created_at) : null;
      setRegistrationDate(regDate);
      
      // If current view month is before registration date, set it to registration month
      if (regDate && currentViewMonth < regDate) {
        setCurrentViewMonth(new Date(regDate));
      }
    }
  }, [user, currentViewMonth]);

  // Update logs when habitLogs changes
  useEffect(() => {
    if (habitLogs && habitLogs.length > 0) {
      setLogs(habitLogs);
      
      // Extract unique dates from habit logs
      const dates = Array.from(new Set(habitLogs.map(log => log.log_date)));
      setActiveDates(dates);
    }
  }, [habitLogs]);
  
  // Filter completed goals when userGoals changes
  useEffect(() => {
    if (userGoals && userGoals.length > 0) {
      // A goal is considered completed if its current_value is greater than or equal to its target_value
      const completed = userGoals.filter(goal => goal.current_value >= goal.target_value);
      setCompletedGoals(completed);
    }
  }, [userGoals]);

  useEffect(() => {
    // Filter logs by selected date and category
    if (selectedDate) {
      let filtered = logs.filter(log => log.log_date === selectedDate);
      
      // Filter by category if a specific category is selected
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(log => {
          const habit = habits?.find(h => h.id === log.habit_id);
          return habit && habit.category === selectedCategory;
        });
      }
      
      setFilteredLogs(filtered);
      
      // Find completed goals for the selected date
      if (userGoals && userGoals.length > 0) {
        // A goal is considered completed if its current_value is greater than or equal to its target_value
        // We'll use the updated_at field to determine when it was completed
        const dateGoals = userGoals.filter(goal => {
          return goal.current_value >= goal.target_value && 
                 goal.updated_at && 
                 goal.updated_at.split('T')[0] === selectedDate;
        });
        setCompletedGoals(dateGoals);
      }
    } else {
      setFilteredLogs([]);
    }
  }, [selectedDate, selectedCategory, logs]);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };
  
  // Format the selected date to display correctly in the UI
  const formatSelectedDate = (dateString: string) => {
    // Create a new date object with the correct timezone handling
    const date = new Date(dateString);
    // Add one day to account for timezone issues
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString();
  };

  const renderLogItem = ({ item }: { item: HabitLog }) => {
    // Find the habit name from the habits array
    const habitName = habits?.find((h: any) => h.id === item.habit_id)?.name || 'Unknown habit';
    
    return (
      <View style={styles.logItem}>
        <View style={styles.logHeader}>
          <Text style={styles.logTitle}>{habitName}</Text>
          <Text style={styles.logQuantity}>x{item.quantity}</Text>
        </View>
        {item.notes && (
          <Text style={styles.logDescription}>{item.notes}</Text>
        )}
        <View style={styles.logDetails}>
          <Text style={styles.logCO2}>{item.co2_saving} kg CO₂ saved</Text>
        </View>
      </View>
    );
  };
  
  // Render a completed goal item
  const renderCompletedGoalItem = ({ item }: { item: UserGoal }) => {
    return (
      <View style={styles.completedGoalItem}>
        <View style={styles.completedGoalHeader}>
          <Text style={styles.completedGoalTitle}>{item.goal_name}</Text>
          <Text style={styles.completedGoalCategory}>{item.category || 'General'}</Text>
        </View>
        <View style={styles.completedGoalProgress}>
          <Text style={styles.completedGoalProgressText}>
            Completed: {item.current_value}/{item.target_value} {item.unit || 'units'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    > 
    <ScrollView 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.content, isTabletOrLarger && { alignSelf: 'center', width: '60%', maxWidth: 700 }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Habit History</Text>
            <Text style={styles.subtitle}>Track your progress over time</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalActions || 12}</Text>
            <Text style={styles.statLabel}>Actions Taken</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCO2Saved?.toFixed(1) || '6.3'}</Text>
            <Text style={styles.statLabel}>CO₂ Saved (kg)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{overallStreak || 5}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calendar</Text>
          
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity 
                onPress={goToPreviousMonth}
                style={styles.calendarNavButton}
              >
                <Ionicons name="chevron-back" size={24} color="#2E7D32" />
              </TouchableOpacity>
              
              <Text style={styles.calendarHeaderText}>
                {currentViewMonth.toLocaleString('default', { month: 'long' })} {currentViewMonth.getFullYear()}
              </Text>
              
              <TouchableOpacity 
                onPress={goToNextMonth}
                style={styles.calendarNavButton}
                disabled={currentViewMonth.getMonth() === new Date().getMonth() && 
                         currentViewMonth.getFullYear() === new Date().getFullYear()}
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={24} 
                  color={currentViewMonth.getMonth() === new Date().getMonth() && 
                         currentViewMonth.getFullYear() === new Date().getFullYear() ? 
                         "#AAAAAA" : "#2E7D32"} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Days of the week header */}
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
                  key={day.date || `empty-${day.day}`}
                  style={[
                    styles.calendarDay,
                    day.isActive && styles.calendarDayActive,
                    day.isDisabled && styles.calendarDayDisabled,
                    // Apply GitHub-style activity level colors
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
                      // Adjust text color for high activity to ensure readability
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter by Category</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {Object.entries(defaultCategories).map(([id, name]) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.filterButton,
                  selectedCategory === id && styles.filterButtonActive,
                ]}
                onPress={() => handleSelectCategory(id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedCategory === id && styles.filterTextActive,
                  ]}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedDate ? `Habits on ${formatSelectedDate(selectedDate)}` : 'Select a date'}
            </Text>
            {selectedDate && filteredLogs.length > 0 && (
              <View style={styles.actionCountBadge}>
                <Text style={styles.actionCountText}>{filteredLogs.length} action{filteredLogs.length !== 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
          
          {filteredLogs.length > 0 ? (
            <FlatList
              data={filteredLogs}
              renderItem={renderLogItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {selectedDate ? 'No habits logged for this date and filter' : 'Select a date to view logged habits'}
              </Text>
            </View>
          )}
        </View>
        
        {/* Completed Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Goals</Text>
          
          {completedGoals.length > 0 ? (
            <FlatList
              data={completedGoals}
              renderItem={renderCompletedGoalItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No completed goals yet. Keep working towards your targets!
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create<Styles>({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  actionCountBadge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  actionCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  filterText: {
    fontSize: 14,
    color: '#333333',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  calendarHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  calendarNavButton: {
    padding: 8,
    borderRadius: 20,
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayItem: {
    width: '14.28%',
    alignItems: 'center',
    padding: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDayLowActivity: {
    backgroundColor: '#E8F5E9',
  },
  calendarDayMediumActivity: {
    backgroundColor: '#A5D6A7',
  },
  calendarDayHighActivity: {
    backgroundColor: '#4CAF50',
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 20,
    marginHorizontal: '0.5%',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  calendarDayActive: {
    backgroundColor: '#E8F5E9',
  },
  calendarDayActiveText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  calendarDayDisabled: {
    opacity: 0.5,
  },
  calendarDayDisabledText: {
    color: '#CCCCCC',
  },
  logContainer: {
    marginTop: 8,
  },
  logItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logDate: {
    fontSize: 14,
    color: '#555555',
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  logDescription: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  logDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  logQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  logCO2: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
  },
  // Styles for completed goals section
  completedGoalItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  completedGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedGoalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  completedGoalCategory: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
  },
  completedGoalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedGoalProgressText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
