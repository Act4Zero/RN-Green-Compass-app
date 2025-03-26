import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import goalStyles from '../styles/Goal.styles';

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
}) => (
  <View style={goalStyles.section}>
    <Text style={goalStyles.sectionTitle}>
      Set your target number of actions
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
  </View>
);

export default GoalInput;
