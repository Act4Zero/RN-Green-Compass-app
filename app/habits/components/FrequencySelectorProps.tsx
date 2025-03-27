import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import goalStyles from '../styles/Goal.styles';
import { TimeFrequency } from '../../components/home/types/goal.types';

interface FrequencySelectorProps {
  frequency: TimeFrequency;
  onFrequencyChange: (frequency: TimeFrequency) => void;
}

const FrequencySelector: React.FC<FrequencySelectorProps> = ({ frequency, onFrequencyChange }) => {
  const options: TimeFrequency[] = ['daily', 'weekly', 'monthly', 'one-time'];

  return (
    <View style={goalStyles.section}>
      <Text style={goalStyles.sectionTitle}>
        How often would you like to track your progress?
      </Text>
      <View style={goalStyles.frequencyContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              goalStyles.frequencyOption,
              frequency === option && goalStyles.frequencyOptionSelected,
            ]}
            onPress={() => onFrequencyChange(option)}
          >
            <Text
              style={[
                goalStyles.frequencyText,
                { color: frequency === option ? '#FFFFFF' : '#333333' },
              ]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default FrequencySelector;
