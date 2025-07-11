import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { locateButtonStyles } from '../../styles/map/LocateButtonStyles';

interface LocateButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

import { ActivityIndicator } from 'react-native';

export default function LocateButton({ onPress, isLoading }: LocateButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, isLoading && { opacity: 0.5 }]}
      onPress={onPress}
      accessibilityLabel="Find my location"
      accessibilityRole="button"
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size={22} color="#333333" />
      ) : (
        <Ionicons name="locate" size={22} color="#333333" />
      )}
    </TouchableOpacity>
  );
}

const styles = locateButtonStyles;
