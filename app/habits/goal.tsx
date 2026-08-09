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
import Button from '@/components/Button';
import { goalStyles } from '@/styles/Goal.styles';
import { focusAreas } from '@/types/goal.types';
import FocusAreasComponent from '@/components/habits/goal/FocusAreaComponent';
import FrequencySelector from '@/components/habits/goal/FrequencySelectorProps';
import GoalInput from '@/components/habits/goal/GoalInput';
import { useAuth } from '@/context/AuthContext';
import useGoalManager from '@/hooks/habits/useGoalManager';
import { useAppTheme } from '@/theme';

export default function Goal() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { theme } = useAppTheme();
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
    }
  }, [user, authLoading, router]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={[goalStyles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[goalStyles.content, { maxWidth: 920 }, isTabletOrLarger && { alignSelf: 'center', width: '100%' }]}>
          <View style={goalStyles.header}>
            <TouchableOpacity 
              style={goalStyles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={[goalStyles.title, { color: theme.colors.text }]}>Shape a new goal</Text>
          </View>

          <Text style={[goalStyles.subtitle, { color: theme.colors.text }]}>1. Choose a focus area</Text>

          <FocusAreasComponent
            focusAreas={focusAreas}
            selectedFocusAreas={selectedFocusAreas}
            toggleFocusArea={toggleFocusArea}
          />

          <Text style={[goalStyles.subtitle, { color: theme.colors.text }]}>2. Choose frequency</Text>
          <FrequencySelector
            frequency={frequency}
            onFrequencyChange={setFrequency}
          />

          <Text style={[goalStyles.subtitle, { color: theme.colors.text }]}>3. Set your target</Text>
          <GoalInput
            targetInputValue={targetInputValue}
            decrementTarget={decrementTarget}
            incrementTarget={incrementTarget}
            handleTargetInputChange={handleTargetInputChange}
            handleTargetInputBlur={handleTargetInputBlur}
          />

          {selectedFocusAreas.length > 0 && (
            <View style={[goalStyles.summaryContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
              <Text style={[goalStyles.summaryText, { color: theme.colors.textMuted }]}>
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
