import React from 'react';
import { View, Text, TouchableOpacity, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mapPopupStyles } from '../../styles/map/MapPopupStyles';
import { MapLocation } from '../../types/map';
import { formatAddress, getPlatformSpecificNavigationUrl } from '../../utils/mapUtils';
import { useMapIntegration } from '../../hooks/useMapIntegration';

interface MapPopupProps {
  location: MapLocation;
}

export default function MapPopup({ location }: MapPopupProps) {
  const { clearSelectedLocation } = useMapIntegration();
  
  // Format the address
  const address = formatAddress(location);
  
  // Handle navigation button press
  const handleNavigate = () => {
    const url = getPlatformSpecificNavigationUrl(
      location.lat,
      location.lng,
      location.name,
      address
    );
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.error("Don't know how to open URI: " + url);
        alert("Couldn't open map application");
      }
    });
  };
  
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
  
  return (
    <View style={styles.popupContainer}>
      <View style={styles.popup}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={clearSelectedLocation}
        >
          <Ionicons name="close" size={24} color="#666666" />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <View style={[styles.categoryIcon, { backgroundColor: iconColor }]}>
            <Ionicons name={iconName as any} size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.title as any}>{location.name}</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color="#666666" style={styles.infoIcon} />
            <Text style={styles.infoText as any}>{formatAddress(location)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="pricetag" size={16} color="#666666" style={styles.infoIcon} />
            <Text style={styles.infoText}>{location.category}</Text>
          </View>
          
          {location.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText as any}>{location.description}</Text>
            </View>
          )}
          
          {/* Conditional EV specific information */}
          {location.category === 'EV Charging Stations' && (
            <>
              {location.usage_cost && (
                <View style={styles.infoRow}>
                  <Ionicons name="cash" size={16} color="#666666" style={styles.infoIcon} />
                  <Text style={styles.infoText}>Cost: {location.usage_cost}</Text>
                </View>
              )}
              
              {location.power_kw && (
                <View style={styles.infoRow}>
                  <Ionicons name="flash" size={16} color="#666666" style={styles.infoIcon} />
                  <Text style={styles.infoText}>Power: {location.power_kw} kW</Text>
                </View>
              )}
            </>
          )}
          
          {location.source && (
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText as any}>Source: {location.source || 'Community'}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.navigationButton} onPress={handleNavigate}>
          <Ionicons name="navigate" size={18} color="#FFFFFF" />
          <Text style={styles.navigationText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Use the external styles imported from MapPopupStyles
const styles = mapPopupStyles;
