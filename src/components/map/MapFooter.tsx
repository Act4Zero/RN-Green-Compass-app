import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useMapIntegration } from '../../hooks/useMapIntegration';

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

interface Styles {
  container: React.CSSProperties | any;
  contentRow: React.CSSProperties | any;
  separator: React.CSSProperties | any;
  linkText: React.CSSProperties | any;
  errorText: React.CSSProperties | any;
}

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 16,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 12,
  },
  linkText: {
    fontSize: 12,
    color: '#555555',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 8,
  },
});
