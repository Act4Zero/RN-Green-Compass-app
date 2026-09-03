import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import goalStyles from '@/styles/Goal.styles';
import { useAppLocale } from '@/context/AppLocaleContext';

interface GoalInputProps {
  targetInputValue: string;
  decrementTarget: () => void;
  incrementTarget: () => void;
  handleTargetInputChange: (value: string) => void;
  handleTargetInputBlur: () => void;
}

const GoalInput: React.FC<GoalInputProps> = ({
  targetInputValue,
  decrementTarget,
  incrementTarget,
  handleTargetInputChange,
  handleTargetInputBlur,
}) => {
  const { t } = useAppLocale();
  return <View style={goalStyles.section}>
    <Text style={goalStyles.sectionTitle}>
      {t('Set your target number of actions', 'Задайте целевия брой действия')}
    </Text>
    <View style={goalStyles.goalInputContainer}>
      <TouchableOpacity
        style={goalStyles.goalNumberButton}
        onPress={decrementTarget}
      >
        <Text style={goalStyles.goalNumberButtonText}>-</Text>
      </TouchableOpacity>

      <View style={goalStyles.goalNumberContainer}>
        <TextInput
          style={goalStyles.goalNumber}
          value={targetInputValue}
          onChangeText={handleTargetInputChange}
          onBlur={handleTargetInputBlur}
          keyboardType="number-pad"
          maxLength={2}
          textAlign="center"
          textAlignVertical="center"
        />
      </View>

      <TouchableOpacity
        style={goalStyles.goalNumberButton}
        onPress={incrementTarget}
      >
        <Text style={goalStyles.goalNumberButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>;
};

export default GoalInput;
