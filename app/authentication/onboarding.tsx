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

const focusAreas: FocusArea[] = [
  { id: '1', name: 'Reduce plastic waste', icon: 'trash-outline', category: 'waste' },
  { id: '2', name: 'Use cleaner transport', icon: 'bicycle-outline', category: 'transport' },
  { id: '3', name: 'Lower energy usage', icon: 'flash-outline', category: 'energy' },
  { id: '4', name: 'Eat more sustainably', icon: 'leaf-outline', category: 'food' },
  { id: '5', name: 'Conserve water', icon: 'water-outline', category: 'water' },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { user } = useAuth();
  const { createNewGoal, loading, error } = useGoals();

  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<FrequencyPeriod>('weekly');
  const [targetValue, setTargetValue] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleContinue = async () => {
    if (selectedFocusAreas.length === 0) {
      Alert.alert('Please select at least one focus area');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a goal for each selected focus area
      const promises = selectedFocusAreas.map(async (areaId) => {
        const area = focusAreas.find(a => a.id === areaId);
        if (!area) return;

        return createNewGoal(
          `${area.name} (${frequency})`,
          targetValue,
          area.category,
          undefined,
          undefined,
          `Complete ${targetValue} sustainable actions ${frequency} related to ${area.name.toLowerCase()}`
        );
      });

      await Promise.all(promises);
      
      // Navigate to home screen after goals are created
      router.replace('/home');
    } catch (err) {
      console.error('Error creating goals:', err);
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
          title="Continue to Dashboard"
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
});
