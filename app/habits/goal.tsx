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
            <Text style={[goalStyles.title, { color: theme.colors.text }]}>Създай нова цел</Text>
          </View>

          <Text style={[goalStyles.subtitle, { color: theme.colors.text }]}>1. Избери област</Text>

          <FocusAreasComponent
            focusAreas={focusAreas}
            selectedFocusAreas={selectedFocusAreas}
            toggleFocusArea={toggleFocusArea}
          />

          <Text style={[goalStyles.subtitle, { color: theme.colors.text }]}>2. Избери честота</Text>
          <FrequencySelector
            frequency={frequency}
            onFrequencyChange={setFrequency}
          />

          <Text style={[goalStyles.subtitle, { color: theme.colors.text }]}>3. Определи целта</Text>
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
                Начална цел: <Text style={goalStyles.summaryHighlight}>{targetValue} действия</Text>
                {selectedFocusAreas.length === 1 
                  ? ` за ${focusAreas.find(a => a.id === selectedFocusAreas[0])?.name.toLowerCase()}`
                  : ` в ${selectedFocusAreas.length} области`}
              </Text>
            </View>
          )}

          <View style={goalStyles.buttonContainer}>
            <Button
              title="Създай цел"
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
