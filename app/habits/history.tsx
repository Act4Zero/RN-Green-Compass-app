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
import { HabitLog } from '../types/supabase';

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
}

// Mock data for calendar (in a real app, this would come from the database)
const mockDates = [
  '2025-03-01', '2025-03-03', '2025-03-05', '2025-03-06', 
  '2025-03-07', '2025-03-08', '2025-03-10', '2025-03-11'
];

// Mock habit logs (in a real app, this would come from the database)
const mockLogs: HabitLog[] = [
  {
    id: '1',
    user_id: 'user1',
    habit_id: '1',
    log_date: '2025-03-11',
    completed: true,
    quantity: 1,
    co2_saving: 0.5,
    notes: 'Used my reusable bottle all day',
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    user_id: 'user1',
    habit_id: '3',
    log_date: '2025-03-10',
    completed: true,
    quantity: 1,
    co2_saving: 2.5,
    notes: 'Cycled to work',
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    user_id: 'user1',
    habit_id: '6',
    log_date: '2025-03-10',
    completed: true,
    quantity: 2,
    co2_saving: 3.0,
    notes: 'Had plant-based lunch and dinner',
    created_at: '',
    updated_at: '',
  },
  {
    id: '4',
    user_id: 'user1',
    habit_id: '5',
    log_date: '2025-03-08',
    completed: true,
    quantity: 1,
    co2_saving: 0.2,
    notes: 'Made sure to turn off all lights before leaving',
    created_at: '',
    updated_at: '',
  },
  {
    id: '5',
    user_id: 'user1',
    habit_id: '7',
    log_date: '2025-03-07',
    completed: true,
    quantity: 1,
    co2_saving: 0.1,
    notes: 'Took a 5-minute shower',
    created_at: '',
    updated_at: '',
  },
];

// Mock habit names (in a real app, this would come from the database)
const mockHabitNames: Record<string, string> = {
  '1': 'Used reusable water bottle',
  '2': 'Composted food waste',
  '3': 'Cycled instead of driving',
  '4': 'Used public transportation',
  '5': 'Turned off lights when not in use',
  '6': 'Ate a plant-based meal',
  '7': 'Took shorter shower',
};

// Mock categories (in a real app, this would come from the database)
const mockCategories: Record<string, string> = {
  'all': 'All',
  'waste': 'Waste',
  'transport': 'Transport',
  'energy': 'Energy',
  'food': 'Food',
  'water': 'Water',
};

// Mock habit categories (in a real app, this would come from the database)
const mockHabitCategories: Record<string, string> = {
  '1': 'waste',
  '2': 'waste',
  '3': 'transport',
  '4': 'transport',
  '5': 'energy',
  '6': 'food',
  '7': 'water',
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
  
  const { habitLogs } = useHabit();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredLogs, setFilteredLogs] = useState<HabitLog[]>([]);
  
  // In a real app, we would use the data from the hooks
  // For this prototype, we'll use the mock data
  const [activeDates, setActiveDates] = useState<string[]>(mockDates);
  const [logs, setLogs] = useState<HabitLog[]>(mockLogs);

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

  useEffect(() => {
    // Filter logs by selected date and category
    if (selectedDate) {
      let filtered = logs.filter(log => log.log_date === selectedDate);
      
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(log => 
          mockHabitCategories[log.habit_id] === selectedCategory
        );
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

  const renderLogItem = ({ item }: { item: HabitLog }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <Text style={styles.logTitle}>{mockHabitNames[item.habit_id]}</Text>
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
            {Object.entries(mockCategories).map(([id, name]) => (
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
});
