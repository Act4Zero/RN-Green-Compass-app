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
import { StatsContainer } from '@/components/habits/history/StatsContainer';
import { StatsCalendar } from '@/components/habits/history/StatsCalendar';
import CategoryFilters from '@/components/habits/history/CategoryFilters';
import { HabitsHistory } from '@/components/habits/history/HabitsHistory';
import { HabitLog, UserGoal } from '@/types/supabase';
import { historyStyles } from '@/styles/historyStyles';
import CompletedGoals from '@/components/habits/history/CompletedGoals';
import useHistoryManager from '@/hooks/habits/useHistoryManager';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useAppTheme } from '@/theme';

const styles = historyStyles;

export default function HabitHistory() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { theme } = useAppTheme();
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
    }
  }, [user, authLoading, router]);
  
  // Render functions for list items
  const renderLogItem = ({ item }: { item: HabitLog }) => {
    // Find the habit name from the habit_id
    const habitName = habits?.find(h => h.id === item.habit_id)?.name || 'Неизвестен навик';
    
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
          <Text style={styles.logCO2}>{Number(item.co2_saving).toFixed(2)} kg спестен CO₂</Text>
        </View>
      </View>
    );
  };
  
  const renderCompletedGoalItem = ({ item }: { item: UserGoal }) => {
    return (
      <View style={styles.completedGoalItem}>
        <View style={styles.completedGoalHeader}>
          <Text style={styles.completedGoalTitle}>{item.goal_name}</Text>
          <Text style={styles.completedGoalCategory}>{item.category || 'Общи'}</Text>
        </View>
        <View style={styles.completedGoalProgress}>
          <Text style={styles.completedGoalProgressText}>
            Завършено: {item.current_value}/{item.target_value} {item.unit || 'единици'}
          </Text>
        </View>
      </View>
    );
  };



  return (
    <KeyboardAvoidingView
      style={[styles.keyboardAvoidingContainer, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    > 
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: 1040 }, isTabletOrLarger && { alignSelf: 'center', width: '100%' }]}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>История на въздействието</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Проследи закономерностите в напредъка си.</Text>
            </View>
          </View>

          <StatsContainer 
            totalActions={totalActions}
            totalCO2Saved={totalCO2Saved}
            overallStreak={overallStreak}
            selectedDate={selectedDate}
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
