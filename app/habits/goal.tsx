import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import useGoals from '../hooks/useGoals';
import { goalStyles } from './styles/Goal.styles';
import { focusAreas, TimeFrequency } from '../components/home/types/goal.types';
import FocusAreasComponent from './components/FocusAreaComponent';
import FrequencySelector from './components/FrequencySelectorProps';
import GoalInput from './components/GoalInput';

export default function Goal() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createNewGoal, loading, error } = useGoals();
  const { source } = useLocalSearchParams<{ source: string }>();

  // Add a useEffect to redirect if user is not authenticated
  useEffect(() => {
    // Only check after auth loading is complete
    if (!authLoading && !user) {
      console.log('No authenticated user found in onboarding, redirecting to signin');
      router.replace('/auth/signin');
    } else if (!authLoading && user) {
      console.log('Authenticated user in onboarding:', user.id);
    }
  }, [user, authLoading, router]);
  
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<TimeFrequency>('weekly');
  const [targetValue, setTargetValue] = useState(5);
  const [targetInputValue, setTargetInputValue] = useState<string>(targetValue.toString());
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
    // Allow only one selection at a time
    if (selectedFocusAreas.includes(id)) {
      setSelectedFocusAreas([]);
    } else {
      setSelectedFocusAreas([id]);
    }
  };

  const incrementTarget = () => {
    const newValue = Math.min(targetValue + 1, 20);
    setTargetValue(newValue);
    setTargetInputValue(newValue.toString());
  };

  const decrementTarget = () => {
    const newValue = Math.max(targetValue - 1, 1);
    setTargetValue(newValue);
    setTargetInputValue(newValue.toString());
  };

  const handleTargetInputChange = (value: string) => {
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setTargetInputValue(value);
      
      // Convert to number and update targetValue if valid
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        // Ensure value is between 1 and 20
        const boundedValue = Math.min(Math.max(numValue, 1), 20);
        setTargetValue(boundedValue);
      }
    }
  };

  const handleTargetInputBlur = () => {
    // If input is empty or invalid, reset to current targetValue
    if (!targetInputValue || isNaN(parseInt(targetInputValue, 10))) {
      setTargetInputValue(targetValue.toString());
    } else {
      // Ensure displayed value matches actual value (in case of bounds adjustment)
      setTargetInputValue(targetValue.toString());
    }
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
        router.replace('/auth/signin');
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

        // Creative goal titles based on category without frequency in parentheses
        let goalTitle;
        switch(area.name) {
          case 'Mobility':
            goalTitle = 'Green Journey';
            break;
          case 'Food':
            goalTitle = 'Sustainable Bites';
            break;
          case 'Household Activities':
            goalTitle = 'Eco Home Challenge';
            break;
          case 'Heating':
            goalTitle = 'Climate Comfort';
            break;
          default:
            goalTitle = `${area.name} Challenge`;
        }
        const frequencyText = frequency === 'one-time' ? '' : frequency;
        const goalDescription = `Complete ${targetValue} sustainable actions ${frequencyText} related to ${area.name.toLowerCase()}`;
        
        // Calculate end date for time-bound goals
        let endDate: string | undefined = undefined;
        const today = new Date();
        
        if (frequency === 'daily') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          endDate = tomorrow.toISOString().split('T')[0];
        } else if (frequency === 'weekly') {
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          endDate = nextWeek.toISOString().split('T')[0];
        } else if (frequency === 'monthly') {
          const nextMonth = new Date(today);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          endDate = nextMonth.toISOString().split('T')[0];
        }

        // Create new goal with all required fields
        console.log('Creating new goal:', {
          title: goalTitle,
          targetValue,
          category: area.category,
          description: goalDescription,
          userId: user.id,
          endDate
        });
        
        const result = await createNewGoal(
          goalTitle,
          targetValue,
          area.category,
          undefined, // subcategory
          undefined, // habitId
          goalDescription,
          endDate
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
    <KeyboardAvoidingView
      style={goalStyles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
    <ScrollView 
      contentContainerStyle={goalStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[goalStyles.content, isTabletOrLarger && { alignSelf: 'center', width: '60%', maxWidth: 700 }]}> 
        <View style={goalStyles.header}>
        <TouchableOpacity 
              style={goalStyles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
          <Text style={goalStyles.title}>Set Your Sustainability Goals</Text>
        </View>

        <View style={goalStyles.section}>
          <Text style={goalStyles.sectionTitle}>What would you like to focus on?</Text>
          <Text style={goalStyles.sectionSubtitle}>Select one area to focus on (you can change this later)</Text>

          <FocusAreasComponent
            focusAreas={focusAreas}
            selectedFocusAreas={selectedFocusAreas}
            toggleFocusArea={toggleFocusArea}
          />
        </View>

        <FrequencySelector
          frequency={frequency}
          setFrequency={setFrequency}
        />

        <GoalInput
          targetInputValue={targetInputValue}
          decrementTarget={decrementTarget}
          incrementTarget={incrementTarget}
          handleTargetInputChange={handleTargetInputChange}
          handleTargetInputBlur={handleTargetInputBlur}
        />

        {selectedFocusAreas.length > 0 && (
          <View style={goalStyles.summaryContainer}>
            <Text style={goalStyles.summaryText}>
              Your initial target: <Text style={goalStyles.summaryHighlight}>{targetValue} actions {frequency !== 'one-time' ? frequency : ''}</Text>
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
    </KeyboardAvoidingView>
  );
}
