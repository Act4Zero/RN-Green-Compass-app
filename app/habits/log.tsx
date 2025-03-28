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
import { Habit } from '../types/supabase';
import LogStyles from './styles/LogStyles';
import CategoriesSection from './components/log/CategoriesSection';
import SubcategoriesSection from './components/log/SubcategoriesSection';
import HabitsSection from './components/log/HabitsSection';
import SelectedHabitSection from './components/log/SelectedHabitSection';
import useLogManager from './hooks/useLogManager';
import { useAuth } from '../context/AuthContext';

// Styles for this component
const styles = LogStyles;

export default function LogHabit() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
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
      } else if (!authLoading && user) {
        console.log('Authenticated user in log habit:', user.id);
      }
    }, [user, authLoading, router]);

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
            <Text style={styles.title}>Log a Habit</Text>
            <Text style={styles.subtitle}>Track your sustainable actions</Text>
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
            <Text style={styles.toastText}>Habit logged successfully!</Text>
          </View>
        </View>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
