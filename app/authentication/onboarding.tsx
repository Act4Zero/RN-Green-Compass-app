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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import useGoals from '../hooks/useGoals';

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  sectionSubtitle: TextStyle;
  optionsContainer: ViewStyle;
  optionItem: ViewStyle;
  optionItemSelected: ViewStyle;
  optionText: TextStyle;
  optionIcon: ViewStyle;
  frequencyContainer: ViewStyle;
  frequencyOption: ViewStyle;
  frequencyOptionSelected: ViewStyle;
  frequencyText: TextStyle;
  goalInputContainer: ViewStyle;
  goalNumberContainer: ViewStyle;
  goalNumber: TextStyle;
  goalNumberButton: ViewStyle;
  goalNumberButtonText: TextStyle;
  summaryContainer: ViewStyle;
  summaryText: TextStyle;
  summaryHighlight: TextStyle;
}

type FocusArea = {
  id: string;
  name: string;
  icon: string;
  category: string;
};

type FrequencyPeriod = 'daily' | 'weekly' | 'monthly';

// Map category names to icons for UI display
const categoryIcons: Record<string, string> = {
  'Mobility': 'bicycle-outline',
  'Food': 'nutrition-outline',
  'Household Activities': 'home-outline',
  'Heating': 'thermometer-outline',
  // Fallback icons for any other categories
  'waste': 'trash-outline',
  'energy': 'flash-outline',
  'water': 'water-outline',
  'lifestyle': 'person-outline',
  'community': 'people-outline',
  'other': 'options-outline'
};

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createNewGoal, updateExistingGoal, userGoals, activeUserGoals, loading, error } = useGoals();
  const { source } = useLocalSearchParams<{ source: string }>();

  // Add a useEffect to redirect if user is not authenticated
  useEffect(() => {
    // Only check after auth loading is complete
    if (!authLoading && !user) {
      console.log('No authenticated user found in onboarding, redirecting to signin');
      router.replace('/authentication/signin');
    } else if (!authLoading && user) {
      console.log('Authenticated user in onboarding:', user.id);
    }
  }, [user, authLoading, router]);

  // Hardcoded focus areas
  const [focusAreas] = useState<FocusArea[]>([
    { id: '1', name: 'Mobility', icon: 'bicycle-outline', category: 'Mobility' },
    { id: '2', name: 'Food', icon: 'nutrition-outline', category: 'Food' },
    { id: '3', name: 'Household Activities', icon: 'home-outline', category: 'Household Activities' },
    { id: '4', name: 'Heating', icon: 'thermometer-outline', category: 'Heating' }
  ]);
  
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<FrequencyPeriod>('weekly');
  const [targetValue, setTargetValue] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingGoals, setExistingGoals] = useState<Record<string, any>>({});

  // When coming from home screen, we want to start from scratch for new goal creation
  // No need to load existing goals data when creating a new goal
  useEffect(() => {
    // Reset state when coming from home to create a new goal
    setSelectedFocusAreas([]);
    setExistingGoals({});
    setFrequency('weekly');
    setTargetValue(5);
  }, [source]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const toggleFocusArea = (id: string) => {
    if (selectedFocusAreas.includes(id)) {
      setSelectedFocusAreas(selectedFocusAreas.filter(areaId => areaId !== id));
    } else {
      setSelectedFocusAreas([...selectedFocusAreas, id]);
    }
  };

  const incrementTarget = () => {
    setTargetValue(prev => Math.min(prev + 1, 20));
  };

  const decrementTarget = () => {
    setTargetValue(prev => Math.max(prev - 1, 1));
  };

  const handleSkip = () => {
    // Skip onboarding and navigate to home screen
    router.replace('/home');
  };

  const handleContinue = async () => {
    console.log('Handle continue button pressed');
    
    if (selectedFocusAreas.length === 0) {
      Alert.alert('Please select at least one focus area');
      return;
    }

    // Check for user authentication with better logging
    if (!user) {
      console.log('User not authenticated in handleContinue');
      console.log('Auth loading state:', authLoading);
      
      if (authLoading) {
        Alert.alert('Please wait', 'Still loading your account information...');
      } else {
        Alert.alert('Error', 'User not authenticated. Please sign in again.');
        router.replace('/authentication/signin');
      }
      return;
    }

    console.log('Starting goal creation/update process');
    console.log('Selected focus areas:', selectedFocusAreas);
    console.log('User:', user.id);
    
    setIsSubmitting(true);

    try {
      // Process each selected focus area
      const promises = selectedFocusAreas.map(async (areaId) => {
        const area = focusAreas.find(a => a.id === areaId);
        if (!area) {
          console.log('Area not found:', areaId);
          return null;
        }

        const goalTitle = `${area.name} (${frequency})`;
        const goalDescription = `Complete ${targetValue} sustainable actions ${frequency} related to ${area.name.toLowerCase()}`;

        // Create new goal with all required fields
        console.log('Creating new goal:', {
          title: goalTitle,
          targetValue,
          category: area.category,
          description: goalDescription,
          userId: user.id
        });
        
        const result = await createNewGoal(
          goalTitle,
          targetValue,
          area.category,
          undefined, // subcategory
          undefined, // habitId
          goalDescription,
          undefined  // endDate
        );
        
        console.log('Creation result:', result);
        return result;
      });

      console.log('Waiting for all promises to resolve...');
      const results = await Promise.all(promises);
      console.log('Goal creation/update results:', results);
      
      console.log('Navigation to home screen');
      // Navigate back to the appropriate screen
      router.replace('/home');
    } catch (err) {
      console.error('Error saving goals:', err);
      Alert.alert('Error', 'Failed to save your goals. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, isTabletOrLarger && { paddingHorizontal: 48 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Set Your Sustainability Goals</Text>
          <Text style={styles.subtitle}>
            Choose what you'd like to focus on to make a positive impact
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What would you like to focus on?</Text>
          <Text style={styles.sectionSubtitle}>Select one or more areas (you can change these later)</Text>

          <View style={styles.optionsContainer}>
            {focusAreas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.optionItem,
                  selectedFocusAreas.includes(area.id) && styles.optionItemSelected,
                ]}
                onPress={() => toggleFocusArea(area.id)}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name={area.icon as any}
                    size={24}
                    color={selectedFocusAreas.includes(area.id) ? '#FFFFFF' : '#2E7D32'}
                  />
                </View>
                <Text
                  style={[
                    styles.optionText,
                    { color: selectedFocusAreas.includes(area.id) ? '#FFFFFF' : '#333333' },
                  ]}
                >
                  {area.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How often would you like to track your progress?</Text>
          
          <View style={styles.frequencyContainer}>
            <TouchableOpacity
              style={[
                styles.frequencyOption,
                frequency === 'daily' && styles.frequencyOptionSelected,
              ]}
              onPress={() => setFrequency('daily')}
            >
              <Text
                style={[
                  styles.frequencyText,
                  { color: frequency === 'daily' ? '#FFFFFF' : '#333333' },
                ]}
              >
                Daily
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.frequencyOption,
                frequency === 'weekly' && styles.frequencyOptionSelected,
              ]}
              onPress={() => setFrequency('weekly')}
            >
              <Text
                style={[
                  styles.frequencyText,
                  { color: frequency === 'weekly' ? '#FFFFFF' : '#333333' },
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.frequencyOption,
                frequency === 'monthly' && styles.frequencyOptionSelected,
              ]}
              onPress={() => setFrequency('monthly')}
            >
              <Text
                style={[
                  styles.frequencyText,
                  { color: frequency === 'monthly' ? '#FFFFFF' : '#333333' },
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Set your target number of actions</Text>
          
          <View style={styles.goalInputContainer}>
            <TouchableOpacity
              style={styles.goalNumberButton}
              onPress={decrementTarget}
            >
              <Text style={styles.goalNumberButtonText}>-</Text>
            </TouchableOpacity>
            
            <View style={styles.goalNumberContainer}>
              <Text style={styles.goalNumber}>{targetValue}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.goalNumberButton}
              onPress={incrementTarget}
            >
              <Text style={styles.goalNumberButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {selectedFocusAreas.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Your initial target: <Text style={styles.summaryHighlight}>{targetValue} actions {frequency}</Text>
              {selectedFocusAreas.length === 1 
                ? ` to ${focusAreas.find(a => a.id === selectedFocusAreas[0])?.name.toLowerCase()}`
                : ` across ${selectedFocusAreas.length} focus areas`}
            </Text>
          </View>
        )}

        <Button
          title={"Create Goal"}
          onPress={handleContinue}
          variant="primary"
          style={{ marginTop: 24, marginBottom: 40 }}
          loading={isSubmitting || loading}
          disabled={isSubmitting || loading || selectedFocusAreas.length === 0}
        />
      </View>
    </ScrollView>
  );
}

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  sectionSubtitle: TextStyle;
  optionsContainer: ViewStyle;
  optionItem: ViewStyle;
  optionItemSelected: ViewStyle;
  optionText: TextStyle;
  optionIcon: ViewStyle;
  frequencyContainer: ViewStyle;
  frequencyOption: ViewStyle;
  frequencyOptionSelected: ViewStyle;
  frequencyText: TextStyle;
  goalInputContainer: ViewStyle;
  goalNumberContainer: ViewStyle;
  goalNumber: TextStyle;
  goalNumberButton: ViewStyle;
  goalNumberButtonText: TextStyle;
  summaryContainer: ViewStyle;
  summaryText: TextStyle;
  summaryHighlight: TextStyle;
  buttonContainer: ViewStyle;
  skipContainer: ViewStyle;
  skipButton: ViewStyle;
  skipText: TextStyle;
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionItemSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  frequencyOption: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  frequencyOptionSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  goalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  goalNumberContainer: {
    width: 80,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  goalNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  goalNumberButton: {
    width: 50,
    height: 50,
    backgroundColor: '#E8F5E9',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalNumberButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  summaryContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  summaryHighlight: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  skipContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    color: '#666',
    marginRight: 4,
    fontSize: 14,
  },
});
