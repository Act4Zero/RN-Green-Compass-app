import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { locateButtonStyles } from '../../styles/map/LocateButtonStyles';

interface LocateButtonProps {
  onPress: () => void;
}

export default function LocateButton({ onPress }: LocateButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      accessibilityLabel="Find my location"
      accessibilityRole="button"
    >
      <Ionicons name="locate" size={22} color="#333333" />
    </TouchableOpacity>
  );
}

const styles = locateButtonStyles;
