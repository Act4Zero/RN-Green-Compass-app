import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import useHabitTracking from '../../hooks/useHabitTracking';
import { Habit } from '../../types/supabase';
import { useAppLocale } from '@/context/AppLocaleContext';
import { localizeHabitCategory, localizeHabitSubcategory } from '@/features/habits/localization';

// Map category names to icons and display names based on habits_rows.csv
const categoryIcons: Record<string, {name: string, icon: string}> = {
  'Mobility': { name: 'Mobility', icon: 'bicycle-outline' },
  'Food': { name: 'Food', icon: 'nutrition-outline' },
  'Household Activities': { name: 'Household', icon: 'home-outline' },
  'Heating': { name: 'Heating', icon: 'thermometer-outline' },
  // Fallback icons for any other categories
  'waste': { name: 'Waste Reduction', icon: 'trash-outline' },
  'energy': { name: 'Energy', icon: 'flash-outline' },
  'water': { name: 'Water', icon: 'water-outline' },
  'lifestyle': { name: 'Lifestyle', icon: 'person-outline' },
  'community': { name: 'Community', icon: 'people-outline' },
  'other': { name: 'Other', icon: 'options-outline' },
};

interface UseLogManagerReturn {
  // States
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  showToast: boolean;
  isSubmitting: boolean;
  showHabitsList: boolean;
  availableHabits: Habit[];
  categories: {id: string, name: string, icon: string}[];
  subcategories: {id: string, name: string}[];
  
  // From useHabitTracking
  habits: Habit[] | null;
  selectedHabit: Habit | null;
  quantity: number;
  notes: string;
  loading: boolean;
  error: string | null;
  
  // Methods
  handleSelectCategory: (categoryId: string) => void;
  handleSelectSubcategory: (subcategoryId: string) => void;
  handleSelectHabit: (habit: Habit) => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  validateNotes: (notes: string) => boolean;
  handleLogHabit: () => Promise<void>;
  setNotes: (notes: string) => void;
  
  // Router
  router: ReturnType<typeof useRouter>;
}

export default function useLogManager(): UseLogManagerReturn {
  const router = useRouter();
  const { locale, t } = useAppLocale();
  // Get category parameter from navigation if available
  const { category: initialCategory } = useLocalSearchParams();
  
  const { 
    habits, 
    logCompletedHabit, 
    loading, 
    error, 
    quantity, 
    setQuantity, 
    notes, 
    setNotes,
    selectHabit,
    selectedHabit,
    getHabitsByCategoryAndSubcategory,
    getHabitsByCategory
  } = useHabitTracking();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHabitsList, setShowHabitsList] = useState(true);

  // Use the habits from the hook instead of mock data
  const [availableHabits, setAvailableHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string, icon: string}[]>([]);
  const [subcategories, setSubcategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (error) {
      Alert.alert(t('Error', 'Грешка'), error);
    }
  }, [error, t]);

  // Extract categories from habits
  useEffect(() => {
    if (habits && habits.length > 0) {
      // Get unique categories
      const uniqueCategories = Array.from(new Set(habits.map(habit => habit.category).filter(Boolean)));
      
      // Create category objects for UI
      const categoryList = uniqueCategories.map(category => ({
        id: category as string,
        name: localizeHabitCategory(categoryIcons[category as string]?.name || category as string, locale),
        icon: categoryIcons[category as string]?.icon || 'options-outline'
      }));
      
      setCategories(categoryList);
      
      // Set initial available habits
      setAvailableHabits(habits);
      
      // If an initial category was passed via navigation params, select it
      if (initialCategory && typeof initialCategory === 'string') {
        // Find the category in our list to ensure it exists
        const categoryExists = uniqueCategories.includes(initialCategory);
        if (categoryExists) {
          setSelectedCategory(initialCategory);
          // Filter habits by this category
          const categoryHabits = getHabitsByCategory(initialCategory);
          setAvailableHabits(categoryHabits);
        }
      }
    }
  }, [habits, initialCategory, getHabitsByCategory, locale]);

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory && habits) {
      // Get habits for this category
      const categoryHabits = habits.filter(habit => habit.category === selectedCategory);
      
      // Extract unique subcategories
      const uniqueSubcategories = Array.from(
        new Set(categoryHabits.map(habit => habit.subcategory).filter(Boolean))
      );
      
      // Create subcategory objects for UI
      const subcategoryList = uniqueSubcategories.map(subcategory => ({
        id: subcategory as string,
        name: localizeHabitSubcategory(subcategory as string, locale)
      }));
      
      setSubcategories(subcategoryList);
      setSelectedSubcategory(null);
      
      // Update available habits to show all from this category
      setAvailableHabits(categoryHabits);
    } else if (habits) {
      setAvailableHabits(habits);
      setSubcategories([]);
      setSelectedSubcategory(null);
    }
  }, [selectedCategory, habits, locale]);

  // Filter habits by subcategory when it changes
  useEffect(() => {
    if (selectedCategory && selectedSubcategory && habits) {
      // Get habits for this category and subcategory
      const filteredHabits = getHabitsByCategoryAndSubcategory(selectedCategory, selectedSubcategory);
      setAvailableHabits(filteredHabits);
    } else if (selectedCategory && habits) {
      // If subcategory is deselected, show all habits for the category
      const categoryHabits = getHabitsByCategory(selectedCategory);
      setAvailableHabits(categoryHabits);
    }
  }, [selectedSubcategory, selectedCategory, habits, getHabitsByCategoryAndSubcategory, getHabitsByCategory]);

  // Keep habit list visible even when a habit is selected
  useEffect(() => {
    // Always keep the habit list visible
    setShowHabitsList(true);
  }, []);

  const handleSelectCategory = useCallback((categoryId: string) => {
    if (selectedCategory === categoryId) {
      // Deselect if already selected
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
    selectHabit(null);
  }, [selectedCategory, selectHabit]);

  const handleSelectSubcategory = useCallback((subcategoryId: string) => {
    if (selectedSubcategory === subcategoryId) {
      // Deselect if already selected
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategoryId);
    }
    selectHabit(null);
  }, [selectedSubcategory, selectHabit]);

  const handleSelectHabit = useCallback((habit: Habit) => {
    if (selectedHabit?.id === habit.id) {
      // Deselect if already selected
      selectHabit(null);
    } else {
      selectHabit(habit);
    }
  }, [selectedHabit, selectHabit]);

  const incrementQuantity = useCallback(() => {
    setQuantity(quantity + 1);
  }, [quantity, setQuantity]);

  const decrementQuantity = useCallback(() => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }, [quantity, setQuantity]);

  // Validate notes to prevent script injection and ensure proper format
  const validateNotes = useCallback((notes: string) => {
    // Check for potentially dangerous characters or script tags
    const dangerousCharsRegex = /<script|<\/?[a-z]+[^>]*>|javascript:|onerror=|onclick=|onload=/i;
    if (dangerousCharsRegex.test(notes)) {
      return false;
    }
    
    // Limit notes length to prevent excessive data
    if (notes.length > 500) {
      return false;
    }
    
    return true;
  }, []);
  
  const handleLogHabit = useCallback(async () => {
    if (!selectedHabit) {
      Alert.alert(t('Please select a habit to log', 'Моля, изберете навик, който да запишете'));
      return;
    }
    
    // Sanitize notes before saving
    const sanitizedNotes = notes ? notes.trim() : '';
    
    // Validate notes if they exist
    if (sanitizedNotes && !validateNotes(sanitizedNotes)) {
      Alert.alert(t('Invalid input', 'Невалидни данни'), t('Notes contain invalid characters or are too long. Please revise.', 'Бележката съдържа невалидни знаци или е прекалено дълга. Моля, редактирайте я.'));
      return;
    }

    setIsSubmitting(true);

    try {
      await logCompletedHabit(selectedHabit.id, quantity, sanitizedNotes);
      
      // Show success toast briefly
      setShowToast(true);
      setTimeout(() => {
        // Navigate back to home screen
        router.replace('/home');
      }, 1000);
    } catch (err) {
      console.error('Error logging habit:', err);
      Alert.alert(t('Error', 'Грешка'), t('Failed to log habit. Please try again.', 'Навикът не можа да бъде записан. Опитайте отново.'));
      setIsSubmitting(false);
    }
  }, [selectedHabit, notes, validateNotes, logCompletedHabit, quantity, router, t]);

  return {
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
    habits,
    selectedHabit,
    quantity,
    notes,
    loading,
    error,
    
    // Methods
    handleSelectCategory,
    handleSelectSubcategory,
    handleSelectHabit,
    incrementQuantity,
    decrementQuantity,
    validateNotes,
    handleLogHabit,
    setNotes,
    
    // Router
    router,
  };
}
