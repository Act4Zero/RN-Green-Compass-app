import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MapLocation } from '../../types/map';

interface MapMarkerProps {
  location: MapLocation;
  selected?: boolean;
  onPress?: (location: MapLocation) => void;
}

export default function MapMarker({ location, selected = false, onPress }: MapMarkerProps) {
  // Get category icon and color
  const getCategoryIcon = () => {
    switch (location.category) {
      case 'EV Charging Stations':
        return { name: 'flash', color: '#4CAF50' };
      case 'Recycling':
        return { name: 'refresh-circle', color: '#2196F3' };
      case 'Organic Food':
        return { name: 'leaf', color: '#8BC34A' };
      case 'Zero-Waste':
        return { name: 'trash-bin-outline', color: '#FF9800' };
      case 'Green Building':
        return { name: 'home', color: '#9C27B0' };
      case 'Community':
        return { name: 'people', color: '#E91E63' };
      default:
        return { name: 'location', color: '#757575' };
    }
  };

  const { name: iconName, color: iconColor } = getCategoryIcon();
  
  const handlePress = () => {
    if (onPress) {
      onPress(location);
    }
  };

  // This component is designed to be used in web rendering directly
  // For native, the marker rendering is handled via WebView in MapView.tsx
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.markerContainer,
        selected && styles.selectedMarkerContainer
      ]}
      onPress={handlePress}
      accessibilityLabel={`${location.name} - ${location.category}`}
      accessibilityRole="button"
    >
      <View style={[styles.marker, { backgroundColor: iconColor }]}>
        <Ionicons name={iconName as any} size={16} color="#FFFFFF" />
      </View>
      
      {selected && (
        <View style={styles.selectedNameTag}>
          <Text style={styles.nameText} numberOfLines={1}>
            {location.name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface Styles {
  markerContainer: React.CSSProperties | any;
  selectedMarkerContainer: React.CSSProperties | any;
  marker: React.CSSProperties | any;
  selectedNameTag: React.CSSProperties | any;
  nameText: React.CSSProperties | any;
}

const styles = StyleSheet.create<Styles>({
  markerContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  selectedMarkerContainer: {
    zIndex: 2,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedNameTag: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 120,
  },
});
