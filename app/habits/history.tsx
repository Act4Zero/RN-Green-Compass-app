import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatsContainer } from './components/history/StatsContainer';
import { StatsCalendar } from './components/history/StatsCalendar';
import CategoryFilters from './components/history/CategoryFilters';
import { HabitsHistory } from './components/history/HabitsHistory';
import { HabitLog, UserGoal } from '../types/supabase';
import { historyStyles } from './styles/historyStyles';
import CompletedGoals from './components/history/CompletedGoals';
import useHistoryManager from './hooks/useHistoryManager';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const styles = historyStyles;

export default function HabitHistory() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, loading: authLoading } = useAuth();
  
  // Use our custom hook to manage all the history logic
  const {
    selectedDate,
    selectedCategory,
    filteredLogs,
    completedGoals,
    calendarDays,
    currentMonthName,
    currentYearNum,
    currentViewMonth,
    totalCO2Saved,
    totalActions,
    overallStreak,
    habits,
    handleSelectDate,
    handleSelectCategory,
    goToPreviousMonth,
    goToNextMonth,
    formatSelectedDate,
    router
  } = useHistoryManager();

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    // Only check after auth loading is complete
    if (!authLoading && !user) {
      console.log('No authenticated user found in history, redirecting to signin');
      router.replace('/auth/signin');
    } else if (!authLoading && user) {
      console.log('Authenticated user in history:', user.id);
    }
  }, [user, authLoading, router]);
  
  // Render functions for list items
  const renderLogItem = ({ item }: { item: HabitLog }) => {
    // Find the habit name from the habit_id
    const habitName = habits?.find(h => h.id === item.habit_id)?.name || 'Unknown habit';
    
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
          <Text style={styles.logCO2}>{Number(item.co2_saving).toFixed(2)} kg CO₂ saved</Text>
        </View>
      </View>
    );
  };
  
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

          <StatsContainer 
            totalActions={totalActions}
            totalCO2Saved={totalCO2Saved}
            overallStreak={overallStreak}
            styles={styles}
          />

          <StatsCalendar
            goToPreviousMonth={goToPreviousMonth}
            goToNextMonth={goToNextMonth}
            currentMonthName={currentMonthName}
            currentYearNum={currentYearNum}
            currentViewMonth={currentViewMonth}
            calendarDays={calendarDays as any}
            handleSelectDate={handleSelectDate}
            selectedDate={selectedDate}
          />

          <CategoryFilters
            selectedCategory={selectedCategory}
            handleSelectCategory={handleSelectCategory}
          />

          <HabitsHistory
            selectedDate={selectedDate as any}
            filteredLogs={filteredLogs}
            renderLogItem={renderLogItem as any}
            formatSelectedDate={formatSelectedDate as any}
          />
          
          <CompletedGoals
            completedGoals={completedGoals}
            renderCompletedGoalItem={renderCompletedGoalItem as any}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
