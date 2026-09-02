import React, { useEffect } from 'react';
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
import { Habit } from '@/types/supabase';
import LogStyles from '@/styles/LogStyles';
import CategoriesSection from '@/components/habits/log/CategoriesSection';
import SubcategoriesSection from '@/components/habits/log/SubcategoriesSection';
import HabitsSection from '@/components/habits/log/HabitsSection';
import SelectedHabitSection from '@/components/habits/log/SelectedHabitSection';
import useLogManager from '@/hooks/habits/useLogManager';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

// Styles for this component
const styles = LogStyles;

export default function LogHabit() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const { user, loading: authLoading } = useAuth();  
  // Use our custom hook to manage all the log screen logic
  const {
    // States
    selectedCategory,
    selectedSubcategory,
    showToast,
    isSubmitting,
    showHabitsList,
    availableHabits,
    categories,
    subcategories,
    
    // From useHabitTracking
    selectedHabit,
    quantity,
    notes,
    loading,
    
    // Methods
    handleSelectCategory,
    handleSelectSubcategory,
    handleSelectHabit,
    incrementQuantity,
    decrementQuantity,
    handleLogHabit,
    setNotes,
    
    // Router
    router
  } = useLogManager();

    // Redirect to signin if user is not authenticated
    useEffect(() => {
      // Only check after auth loading is complete
      if (!authLoading && !user) {
        console.log('No authenticated user found in log habit, redirecting to signin');
        router.replace('/auth/signin');
      }
    }, [user, authLoading, router]);

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
            <Text style={[styles.title, { color: theme.colors.text }]}>{t('Log an action', 'Запиши действие')}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{t('Choose a category, then capture the impact.', 'Избери категория и запиши въздействието.')}</Text>
          </View>
        </View>

        {/* Categories Section */}
        <CategoriesSection
          categories={categories}
          selectedCategory={selectedCategory as string}
          handleSelectCategory={handleSelectCategory}
        />

        {/* Subcategories Section - Only show if a category is selected and subcategories exist */}
        {selectedCategory && subcategories.length > 0 && (
          <SubcategoriesSection
            subcategories={subcategories}
            selectedSubcategory={selectedSubcategory as string}
            handleSelectSubcategory={handleSelectSubcategory}
          />
        )}

        {/* Habits Section - Only show if not collapsed */}
        {showHabitsList && (
          <HabitsSection
            availableHabits={availableHabits}
            selectedHabit={selectedHabit}
            handleSelectHabit={handleSelectHabit}
          />
        )}

        {/* Selected Habit Section - Always visible but only populated when a habit is selected */}
        <SelectedHabitSection
          selectedHabit={selectedHabit}
          decrementQuantity={decrementQuantity}
          incrementQuantity={incrementQuantity}
          quantity={quantity}
          notes={notes}
          setNotes={setNotes}
          selectHabit={handleSelectHabit as (habit: Habit | null) => void}
          handleLogHabit={handleLogHabit}
          isSubmitting={isSubmitting}
          loading={loading}
        />
      </View>

      {showToast && (
        <View style={styles.toastWrapper}>
          <View style={styles.toastContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.toastText}>{t('Habit logged successfully!', 'Навикът е записан успешно!')}</Text>
          </View>
        </View>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
