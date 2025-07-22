import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { coverageAlertStyles } from '../../styles/map/CoverageAlertStyles';
import { useMapIntegration } from '../../hooks/useMapIntegration';

export default function CoverageAlert() {
  const { isOutOfCoverage, resetViewportToDefault } = useMapIntegration();
  
  if (!isOutOfCoverage) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.alertBox}>
        <Ionicons name="warning" size={24} color="#FF9800" style={{marginRight: 10}} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Outside Coverage Area</Text>
          <Text style={styles.message}>
            The Sustainability Map is currently only available for Bulgaria. 
            We're working on expanding our coverage!
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.button}
          onPress={resetViewportToDefault}
          accessibilityLabel="Return to Bulgaria"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Return to Bulgaria</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Use the external styles imported from CoverageAlertStyles
const styles = coverageAlertStyles;
