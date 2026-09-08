import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import goalStyles from '@/styles/Goal.styles';
import { TimeFrequency } from '@/types/goal.types';
import { useAppLocale } from '@/context/AppLocaleContext';

interface FrequencySelectorProps {
  frequency: TimeFrequency;
  onFrequencyChange: (frequency: TimeFrequency) => void;
}

const FrequencySelector: React.FC<FrequencySelectorProps> = ({ frequency, onFrequencyChange }) => {
  const { t } = useAppLocale();
  const options: TimeFrequency[] = ['daily', 'weekly', 'monthly', 'one-time'];

  return (
    <View style={goalStyles.section}>
      <Text style={goalStyles.sectionTitle}>
        {t('How often would you like to track your progress?', 'Колко често искате да проследявате напредъка си?')}
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
              {t(option.charAt(0).toUpperCase() + option.slice(1), option === 'daily' ? 'Ежедневно' : option === 'weekly' ? 'Седмично' : option === 'monthly' ? 'Месечно' : 'Еднократно')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default FrequencySelector;
