import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
import { AppButton, PageHeader } from '@/components/ui';
import { goBackOrReplace } from '@/utils/navigation';
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
      <View style={[styles.content, { maxWidth: 1040, padding: 0 }, isTabletOrLarger && { alignSelf: 'center', width: '100%' }]}>
        <PageHeader eyebrow={t('One small win', 'Една малка победа')} title={t('What did you do today? 🌱', 'Какво направи днес? 🌱')} description={t('Choose an action, add the details and give your green world a little growth.', 'Избери действие, добави подробности и дай малко растеж на своя зелен свят.')} action={<AppButton variant="ghost" label={t('Back', 'Назад')} icon="arrow-back" onPress={() => goBackOrReplace(router, '/habits')} />} />
        <View accessibilityLabel={t('Logging progress', 'Напредък на записа')} style={{ flexDirection: 'row', gap: 6, marginBottom: 26 }}>
          {[t('Topic', 'Тема'), t('Type', 'Вид'), t('Action', 'Действие'), t('Save', 'Запис')].map((label, index) => {
            const step = selectedHabit ? 4 : showHabitsList ? 3 : selectedCategory ? 2 : 1;
            const active = index + 1 <= step;
            return <View key={index} style={{ flex: 1, gap: 8, alignItems: 'center', paddingVertical: 12, borderRadius: 16, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surfaceMuted }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? theme.colors.primary : theme.colors.surface }}><Text style={[theme.typography.label, { color: active ? theme.colors.textInverse : theme.colors.textMuted }]}>{index + 1 < step ? '✓' : index + 1}</Text></View>
              <Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted, fontSize: 11 }]}>{label}</Text>
            </View>;
          })}
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
