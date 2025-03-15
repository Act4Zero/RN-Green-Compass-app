import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Input from '../components/Input';
import useHabitTracking from '../hooks/useHabitTracking';
import { Habit } from '../types/supabase';

interface Styles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  categoriesContainer: ViewStyle;
  categoryItem: ViewStyle;
  categoryItemSelected: ViewStyle;
  categoryText: TextStyle;
  categoryIcon: ViewStyle;
  subcategoriesContainer: ViewStyle;
  subcategoryItem: ViewStyle;
  subcategoryItemSelected: ViewStyle;
  subcategoryText: TextStyle;
  habitsContainer: ViewStyle;
  habitItem: ViewStyle;
  habitItemSelected: ViewStyle;
  habitTitle: TextStyle;
  habitDescription: TextStyle;
  habitCO2: TextStyle;
  quantityContainer: ViewStyle;
  quantityLabel: TextStyle;
  quantityControls: ViewStyle;
  quantityButton: ViewStyle;
  quantityButtonText: TextStyle;
  quantityValue: TextStyle;
  notesContainer: ViewStyle;
  confirmButton: ViewStyle;
  toastWrapper: ViewStyle;
  toastContainer: ViewStyle;
  toastText: TextStyle;
  habitItemContent: ViewStyle;
  habitItemWrapper: ViewStyle;
  // New style properties for selected habit section
  selectedHabitContainer: ViewStyle;
  selectedHabitHeader: ViewStyle;
  selectedHabitInfo: ViewStyle;
  selectedHabitTitle: TextStyle;
  selectedHabitCO2: TextStyle;
  selectedHabitDescription: TextStyle;
  deselectButton: ViewStyle;
  notesLabel: TextStyle;
  noHabitSelectedContainer: ViewStyle;
  noHabitText: TextStyle;
}

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

export default function LogHabit() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
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
      Alert.alert('Error', error);
    }
  }, [error]);

  // Extract categories from habits
  useEffect(() => {
    if (habits && habits.length > 0) {
      // Get unique categories
      const uniqueCategories = Array.from(new Set(habits.map(habit => habit.category).filter(Boolean)));
      
      // Create category objects for UI
      const categoryList = uniqueCategories.map(category => ({
        id: category as string,
        name: categoryIcons[category as string]?.name || category as string,
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
  }, [habits, initialCategory, getHabitsByCategory]);

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
        name: subcategory as string
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
  }, [selectedCategory, habits]);

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

  const handleSelectCategory = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      // Deselect if already selected
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
    selectHabit(null);
  };

  const handleSelectSubcategory = (subcategoryId: string) => {
    if (selectedSubcategory === subcategoryId) {
      // Deselect if already selected
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategoryId);
    }
    selectHabit(null);
  };

  const handleSelectHabit = (habit: Habit) => {
    if (selectedHabit?.id === habit.id) {
      // Deselect if already selected
      selectHabit(null);
    } else {
      selectHabit(habit);
    }
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleLogHabit = async () => {
    if (!selectedHabit) {
      Alert.alert('Please select a habit to log');
      return;
    }

    setIsSubmitting(true);

    try {
      await logCompletedHabit(selectedHabit.id, quantity, notes);
      
      // Show success toast briefly
      setShowToast(true);
      setTimeout(() => {
        // Navigate back to home screen
        router.replace('/home');
      }, 1000);
    } catch (err) {
      console.error('Error logging habit:', err);
      Alert.alert('Error', 'Failed to log habit. Please try again.');
      setIsSubmitting(false);
    }
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
            <Text style={styles.title}>Log a Habit</Text>
            <Text style={styles.subtitle}>Track your sustainable actions</Text>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a Category</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.categoryItemSelected,
                ]}
                onPress={() => handleSelectCategory(category.id)}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={selectedCategory === category.id ? '#2E7D32' : '#757575'}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === category.id ? '#FFFFFF' : '#333333' },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Subcategories Section - Only show if a category is selected and subcategories exist */}
        {selectedCategory && subcategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select a Subcategory</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={[styles.subcategoriesContainer, { width: subcategories.length * 120 }]}
              decelerationRate="fast"
            >
              {subcategories.map((subcategory) => (
                <TouchableOpacity
                  key={subcategory.id}
                  style={[
                    styles.subcategoryItem,
                    selectedSubcategory === subcategory.id && styles.subcategoryItemSelected,
                  ]}
                  onPress={() => handleSelectSubcategory(subcategory.id)}
                >
                  <Text
                    style={[
                      styles.subcategoryText,
                      { color: selectedSubcategory === subcategory.id ? '#FFFFFF' : '#333333' },
                    ]}
                    numberOfLines={2}
                  >
                    {subcategory.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Habits Section - Only show if not collapsed */}
        {showHabitsList && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select a Habit</Text>
            
            <View style={styles.habitsContainer}>
              {/* If a habit is selected, only show that habit in the list */}
              {(selectedHabit ? [selectedHabit] : availableHabits).map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={[styles.habitItemWrapper]}
                  onPress={() => handleSelectHabit(habit)}
                >
                  <View 
                    style={[
                      styles.habitItem,
                      selectedHabit?.id === habit.id && styles.habitItemSelected,
                    ]}
                  >
                    <View style={styles.habitItemContent}>
                      <Text
                        style={[
                          styles.habitTitle,
                          { color: selectedHabit?.id === habit.id ? '#FFFFFF' : '#333333' },
                        ]}
                        numberOfLines={2}
                      >
                        {habit.name}
                      </Text>
                      <Text
                        style={[
                          styles.habitDescription,
                          { color: selectedHabit?.id === habit.id ? '#E0E0E0' : '#555555' },
                        ]}
                        numberOfLines={3}
                      >
                        {habit.description}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.habitCO2,
                        { color: selectedHabit?.id === habit.id ? '#FFFFFF' : '#2E7D32' },
                      ]}
                    >
                      {habit.estimated_co2_saving} kg CO₂
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Selected Habit Section - Always visible but only populated when a habit is selected */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedHabit ? 'Selected Habit' : 'No Habit Selected'}
          </Text>
          
          {selectedHabit ? (
            <View style={styles.selectedHabitContainer}>
              <View style={styles.selectedHabitHeader}>
                <View style={styles.selectedHabitInfo}>
                  <Text style={styles.selectedHabitTitle}>{selectedHabit.name}</Text>
                  <Text style={styles.selectedHabitCO2}>{selectedHabit.estimated_co2_saving} kg CO₂</Text>
                </View>
                <TouchableOpacity 
                  style={styles.deselectButton}
                  onPress={() => selectHabit(null)}
                >
                  <Ionicons name="close-circle-outline" size={24} color="#555555" />
                </TouchableOpacity>
              </View>
              <Text style={styles.selectedHabitDescription}>{selectedHabit.description}</Text>
              
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>How many times did you do this?</Text>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={decrementQuantity}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={incrementQuantity}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes (Optional)</Text>
                <Input
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any additional details..."
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <Button
                title="Log Habit"
                onPress={handleLogHabit}
                variant="primary"
                style={styles.confirmButton}
                loading={isSubmitting || loading}
                disabled={isSubmitting || loading}
              />
            </View>
          ) : (
            <View style={styles.noHabitSelectedContainer}>
              <Text style={styles.noHabitText}>Please select a habit from the list above</Text>
            </View>
          )}
        </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 100,
  },
  categoryItemSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  // Subcategory styles
  subcategoriesContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
    paddingRight: 16,
    gap: 12,
  },
  subcategoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 100,
    width: 110,  // Fixed width for consistent appearance
    height: 60,  // Fixed height for consistent appearance
    marginRight: 4, // Extra spacing between items
  },
  subcategoryItemSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  subcategoryText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Habit container styles
  habitsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  habitItemWrapper: {
    width: '100%',
  },
  habitItemContent: {
    flex: 1,
    paddingRight: 8,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align to top for better layout with long descriptions
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  habitItemSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    flexShrink: 1, // Allow text to shrink if needed
  },
  habitDescription: {
    fontSize: 14,
    flexShrink: 1, // Allow text to shrink if needed
  },
  habitCO2: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    flexShrink: 0, // Don't allow CO2 value to shrink
    alignSelf: 'flex-start', // Align to top
  },
  // Selected habit section styles
  selectedHabitContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginBottom: 16,
  },
  selectedHabitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  selectedHabitInfo: {
    flex: 1,
    paddingRight: 8,
  },
  selectedHabitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  selectedHabitDescription: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 16,
  },
  selectedHabitCO2: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  deselectButton: {
    padding: 4,
  },
  noHabitSelectedContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  noHabitText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  quantityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginHorizontal: 24,
  },
  notesContainer: {
    marginBottom: 16,
  },
  confirmButton: {
    marginBottom: 40,
  },
  toastWrapper: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  toastContainer: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: '85%',
    maxWidth: 500,
  },
  toastText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
