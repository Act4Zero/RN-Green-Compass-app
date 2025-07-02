import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import { mapFooterStyles } from '../../styles/map/MapFooterStyles';

export default function MapFooter() {
  const { isLoading, error } = useMapIntegration();
  
  const handleOpenOSM = () => {
    Linking.openURL('https://www.openstreetmap.org/copyright');
  };
  
  const handleOpenContribute = () => {
    // This is a placeholder for future contribute functionality
    alert('Contribution features will be available in a future version.');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <TouchableOpacity onPress={handleOpenOSM} accessibilityRole="link">
          <Text style={styles.linkText}>
            © OpenStreetMap contributors
          </Text>
        </TouchableOpacity>
        
        <View style={styles.separator} />
        
        <TouchableOpacity onPress={handleOpenContribute} accessibilityRole="link">
          <Text style={styles.linkText}>
            Contribute a Location
          </Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <Text style={styles.errorText}>
          Error: {error.userMessage || 'Something went wrong'}
        </Text>
      )}
    </View>
  );
}

const styles = mapFooterStyles;
