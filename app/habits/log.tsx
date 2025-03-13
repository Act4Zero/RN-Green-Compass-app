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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Input from '../components/Input';
import useHabitTracking from '../hooks/useHabitTracking';
import { Habit } from '../types/supabase';

interface Styles {
  container: ViewStyle;
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
  toastContainer: ViewStyle;
  toastText: TextStyle;
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

// This will be populated from the database
const emptyHabits: Habit[] = [
  {
    id: '1',
    name: 'Used reusable water bottle',
    description: 'Avoided single-use plastic bottle',
    category: 'waste',
    subcategory: 'plastic',
    estimated_co2_saving: 0.5,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    name: 'Composted food waste',
    description: 'Diverted food waste from landfill',
    category: 'waste',
    subcategory: 'organic',
    estimated_co2_saving: 0.3,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    name: 'Cycled instead of driving',
    description: 'Used bicycle for transportation',
    category: 'transport',
    subcategory: 'commute',
    estimated_co2_saving: 2.5,
    created_at: '',
    updated_at: '',
  },
  {
    id: '4',
    name: 'Used public transportation',
    description: 'Took bus or train instead of driving',
    category: 'transport',
    subcategory: 'commute',
    estimated_co2_saving: 1.8,
    created_at: '',
    updated_at: '',
  },
  {
    id: '5',
    name: 'Turned off lights when not in use',
    description: 'Reduced electricity consumption',
    category: 'energy',
    subcategory: 'electricity',
    estimated_co2_saving: 0.2,
    created_at: '',
    updated_at: '',
  },
  {
    id: '6',
    name: 'Ate a plant-based meal',
    description: 'Reduced meat consumption',
    category: 'food',
    subcategory: 'diet',
    estimated_co2_saving: 1.5,
    created_at: '',
    updated_at: '',
  },
  {
    id: '7',
    name: 'Took shorter shower',
    description: 'Reduced water consumption',
    category: 'water',
    subcategory: 'conservation',
    estimated_co2_saving: 0.1,
    created_at: '',
    updated_at: '',
  },
];

export default function LogHabit() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
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
    selectedHabit
  } = useHabitTracking();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the habits from the hook instead of mock data
  const [availableHabits, setAvailableHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string, icon: string}[]>([]);

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
    }
  }, [habits]);

  useEffect(() => {
    // Filter habits by selected category
    if (selectedCategory && habits) {
      setAvailableHabits(habits.filter(habit => habit.category === selectedCategory));
    } else if (habits) {
      setAvailableHabits(habits);
    }
  }, [selectedCategory, habits]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    selectHabit(null);
  };

  const handleSelectHabit = (habit: Habit) => {
    selectHabit(habit);
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
      
      // Show success toast
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        // Reset form
        selectHabit(null);
        setQuantity(1);
        setNotes('');
      }, 2000);
    } catch (err) {
      console.error('Error logging habit:', err);
      Alert.alert('Error', 'Failed to log habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            <Text style={styles.title}>Log a Habit</Text>
            <Text style={styles.subtitle}>Track your sustainable actions</Text>
          </View>
        </View>

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
                    color={selectedCategory === category.id ? '#FFFFFF' : '#2E7D32'}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a Habit</Text>
          
          <View style={styles.habitsContainer}>
            {availableHabits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.habitItem,
                  selectedHabit?.id === habit.id && styles.habitItemSelected,
                ]}
                onPress={() => handleSelectHabit(habit)}
              >
                <View>
                  <Text
                    style={[
                      styles.habitTitle,
                      { color: selectedHabit?.id === habit.id ? '#FFFFFF' : '#333333' },
                    ]}
                  >
                    {habit.name}
                  </Text>
                  <Text
                    style={[
                      styles.habitDescription,
                      { color: selectedHabit?.id === habit.id ? '#E0E0E0' : '#555555' },
                    ]}
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
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedHabit && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              
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
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes (Optional)</Text>
              
              <View style={styles.notesContainer}>
                <Input
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any additional details..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <Button
              title="Log Habit"
              onPress={handleLogHabit}
              variant="primary"
              style={styles.confirmButton}
              loading={isSubmitting || loading}
              disabled={isSubmitting || loading}
            />
          </>
        )}
      </View>

      {showToast && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          <Text style={styles.toastText}>Habit logged successfully!</Text>
        </View>
      )}
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
  habitsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  habitDescription: {
    fontSize: 14,
    maxWidth: '90%',
  },
  habitCO2: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
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
  },
  toastText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
