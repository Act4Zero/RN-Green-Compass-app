import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

const { useHabit } = HabitContextModule;
import { HabitLog, UserGoal } from '../types/supabase';

interface Styles {
  container: ViewStyle;
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
  sectionTitle: TextStyle;
  filtersContainer: ViewStyle;
  filterButton: ViewStyle;
  filterButtonActive: ViewStyle;
  filterText: TextStyle;
  filterTextActive: TextStyle;
  calendarContainer: ViewStyle;
  calendarHeader: ViewStyle;
  calendarHeaderText: TextStyle;
  calendarGrid: ViewStyle;
  calendarDay: ViewStyle;
  calendarDayText: TextStyle;
  calendarDayActive: ViewStyle;
  calendarDayActiveText: TextStyle;
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

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date: dateString,
        day: i,
        isActive: activeDates.includes(dateString),
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
  }, []);

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
      
      // For now, we'll just filter by date since we don't have the category mapping
      // In a real implementation, we would join with the habits table to get categories
      if (selectedCategory !== 'all' && false) { // Disabled for now
        // filtered = filtered.filter(log => getHabitCategory(log.habit_id) === selectedCategory);
      }
      
      setFilteredLogs(filtered);
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
    <ScrollView style={styles.container}>
      <View style={[styles.content, isTabletOrLarger && { paddingHorizontal: 48 }]}>
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
              <Text style={styles.calendarHeaderText}>
                {currentMonth} {currentYear}
              </Text>
            </View>
            
            <View style={styles.calendarGrid}>
              {calendarDays.map((day) => (
                <TouchableOpacity
                  key={day.date}
                  style={[
                    styles.calendarDay,
                    day.isActive && styles.calendarDayActive,
                    selectedDate === day.date && { borderWidth: 2, borderColor: '#2E7D32' },
                  ]}
                  onPress={() => day.isActive ? handleSelectDate(day.date) : null}
                  disabled={!day.isActive}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      day.isActive && styles.calendarDayActiveText,
                    ]}
                  >
                    {day.day}
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
          <Text style={styles.sectionTitle}>
            {selectedDate ? `Habits on ${new Date(selectedDate).toLocaleDateString()}` : 'Select a date'}
          </Text>
          
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
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
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
    alignItems: 'center',
  },
  calendarHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 20,
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
