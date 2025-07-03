import React from 'react';
import { View, Text, TouchableOpacity, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mapPopupStyles } from '../../styles/map/MapPopupStyles';
import { MapLocation } from '../../types/map';
import { formatAddress, getPlatformSpecificNavigationUrl } from '../../utils/mapUtils';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import { getCategoryIcon } from '../../utils/categoryUtils';

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
  
  // Get category icon and color from the central utility
  const { name: iconName, color: iconColor } = getCategoryIcon(location.category);
  
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
