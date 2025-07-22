import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DebugPanelProps {
  filteredLocationsCount: number;
  filteredLocationsSample: any[];
  onClose: () => void;
}

/**
 * Debug panel component for development environments
 */
export function DebugPanel({ 
  filteredLocationsCount, 
  filteredLocationsSample, 
  onClose 
}: DebugPanelProps) {
  if (!__DEV__) return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>DEBUG: filteredLocations</Text>
          <Text style={styles.count}>Count: {filteredLocationsCount}</Text>
          <Text style={styles.sample}>
            Sample: {JSON.stringify(filteredLocationsSample, null, 2)}
          </Text>
        </View>
        <Text
          style={styles.closeButton}
          onPress={onClose}
          accessibilityRole="button"
        >
          ✕
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', 
    top: 10, 
    right: 10, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    padding: 10, 
    zIndex: 9999, 
    borderRadius: 6
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  title: {
    color: '#fff', 
    fontWeight: 'bold'
  },
  count: {
    color: '#fff'
  },
  sample: {
    color: '#fff', 
    fontSize: 10
  },
  closeButton: {
    color: '#fff', 
    marginLeft: 12, 
    fontWeight: 'bold', 
    fontSize: 16
  }
});

export default DebugPanel;
