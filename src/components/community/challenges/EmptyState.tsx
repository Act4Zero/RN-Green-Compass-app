import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChallengeStyles from '@/styles/community/ChallengeStyles';

interface EmptyStateProps {
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

const styles = ChallengeStyles;

function EmptyState({ message, buttonText, onButtonPress }: EmptyStateProps) {
  return (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="alert-circle-outline" size={48} color="#777777" />
      <Text style={styles.emptyStateText}>{message}</Text>
      
      {buttonText && onButtonPress && (
        <TouchableOpacity 
          style={[
            styles.joinButton,
            {
              marginTop: 24,
              paddingVertical: 12,
              paddingHorizontal: 24,
            }
          ]} 
          onPress={onButtonPress}
        >
          <Text style={styles.joinButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default EmptyState;
