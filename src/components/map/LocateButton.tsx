import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

interface Styles {
  button: React.CSSProperties | any;
}

const styles = StyleSheet.create<Styles>({
  button: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
});
