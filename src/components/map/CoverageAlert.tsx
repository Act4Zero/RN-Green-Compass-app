import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMapIntegration } from '../../hooks/useMapIntegration';

export default function CoverageAlert() {
  const { isOutOfCoverage, resetViewportToDefault } = useMapIntegration();
  
  if (!isOutOfCoverage) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.alertBox}>
        <Ionicons name="warning" size={24} color="#FF9800" style={styles.icon} />
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

interface Styles {
  container: React.CSSProperties | any;
  alertBox: React.CSSProperties | any;
  icon: React.CSSProperties | any;
  textContainer: React.CSSProperties | any;
  title: React.CSSProperties | any;
  message: React.CSSProperties | any;
  button: React.CSSProperties | any;
  buttonText: React.CSSProperties | any;
}

const styles = StyleSheet.create<Styles>({
  container: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  alertBox: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  icon: {
    marginBottom: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
