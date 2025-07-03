import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mapMarkerStyles } from '../../styles/map/MapMarkerStyles';
import { MapLocation } from '../../types/map';
import { getCategoryIcon } from '../../utils/categoryUtils';

interface MapMarkerProps {
  location: MapLocation;
  selected?: boolean;
  onPress?: (location: MapLocation) => void;
}

export default function MapMarker({ location, selected = false, onPress }: MapMarkerProps) {
  // Get category icon and color from the central utility
  const { name: iconName, color: iconColor } = getCategoryIcon(location.category);
  
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

// Use the external styles imported from MapMarkerStyles
const styles = mapMarkerStyles;
