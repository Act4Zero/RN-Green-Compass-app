import React, { useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { goalStyles } from './styles/Goal.styles';
import { focusAreas } from '../components/home/types/goal.types';
import FocusAreasComponent from './components/FocusAreaComponent';
import FrequencySelector from './components/FrequencySelectorProps';
import GoalInput from './components/GoalInput';
import { useAuth } from '../context/AuthContext';
import useGoalManager from './hooks/useGoalManager';

export default function Goal() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { source } = useLocalSearchParams<{ source: string }>();
  const { user, loading: authLoading } = useAuth();

  const {
    selectedFocusAreas,
    frequency,
    targetValue,
    targetInputValue,
    isSubmitting,
    toggleFocusArea,
    incrementTarget,
    decrementTarget,
    handleTargetInputChange,
    handleTargetInputBlur,
    handleContinue,
    setFrequency,
    router,
  } = useGoalManager({ source });

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={goalStyles.container}>
        <View style={[goalStyles.content, isTabletOrLarger && { alignSelf: 'center', width: '60%', maxWidth: 700 }]}> 
          <View style={goalStyles.header}>
            <TouchableOpacity 
              style={goalStyles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <Text style={goalStyles.title}>Set Your Goal</Text>
          </View>

          <Text style={goalStyles.subtitle}>Choose a focus area</Text>

          <FocusAreasComponent
            focusAreas={focusAreas}
            selectedFocusAreas={selectedFocusAreas}
            toggleFocusArea={toggleFocusArea}
          />

          <Text style={goalStyles.subtitle}>Choose frequency</Text>
          <FrequencySelector
            frequency={frequency}
            onFrequencyChange={setFrequency}
          />

          <Text style={goalStyles.subtitle}>Set your target</Text>
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

          <View style={goalStyles.buttonContainer}>
            <Button
              title="Create Goal"
              onPress={handleContinue}
              variant="primary"
              style={{ marginTop: 24, marginBottom: 40 }}
              loading={isSubmitting}
              disabled={isSubmitting || selectedFocusAreas.length === 0}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
