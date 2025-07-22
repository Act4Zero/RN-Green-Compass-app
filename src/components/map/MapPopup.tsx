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
          {/* Address Section */}
          <View style={styles.addressSection}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color="#666666" style={styles.infoIcon} />
              <Text style={styles.infoText as any}>{formatAddress(location)}</Text>
            </View>
            
            {/* Show detailed address components if available */}
            {(location.town || location.state_or_province || location.country) && (
              <View style={styles.locationDetails}>
                {location.town && location.state_or_province && (
                  <Text style={styles.locationDetailText}>
                    {location.town}, {location.state_or_province}
                    {location.country && location.country !== location.state_or_province && `, ${location.country}`}
                  </Text>
                )}
                {location.postcode && (
                  <Text style={styles.locationDetailText}>Postcode: {location.postcode}</Text>
                )}
              </View>
            )}
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
          
          {/* Enhanced EV Charging Station Information */}
          {location.category === 'EV Charging Stations' && (
            <View style={styles.evDetailsSection}>
              <Text style={styles.sectionTitle}>Charging Details</Text>
              
              {/* Power and Charging Speed */}
              <View style={styles.evInfoGrid}>
                {location.power_kw && (
                  <View style={styles.evInfoCard}>
                    <View style={styles.evInfoHeader}>
                      <Ionicons name="flash" size={18} color="#2E7D32" />
                      <Text style={styles.evInfoLabel}>Power</Text>
                    </View>
                    <Text style={styles.evInfoValue}>{location.power_kw} kW</Text>
                    {location.is_fast_charge_capable && (
                      <Text style={styles.fastChargeIndicator}>⚡ Fast Charge</Text>
                    )}
                  </View>
                )}
                
                {location.usage_cost && (
                  <View style={styles.evInfoCard}>
                    <View style={styles.evInfoHeader}>
                      <Ionicons name="cash" size={18} color="#2E7D32" />
                      <Text style={styles.evInfoLabel}>Cost</Text>
                    </View>
                    <Text style={styles.evInfoValue}>{location.usage_cost}</Text>
                  </View>
                )}
              </View>
              
              {/* Connection Type and Level */}
              {(location.connection_type || location.level) && (
                <View style={styles.technicalDetails}>
                  {location.connection_type && (
                    <View style={styles.infoRow}>
                      <Ionicons name="link" size={16} color="#666666" style={styles.infoIcon} />
                      <Text style={styles.infoText}>Connector: {location.connection_type}</Text>
                    </View>
                  )}
                  
                  {location.level && (
                    <View style={styles.infoRow}>
                      <Ionicons name="speedometer" size={16} color="#666666" style={styles.infoIcon} />
                      <Text style={styles.infoText}>Level: {location.level}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
          
          {/* Data Source and License */}
          {(location.source || location.licence) && (
            <View style={styles.sourceSection}>
              {location.source && (
                <Text style={styles.sourceText as any}>Source: {location.source}</Text>
              )}
              {location.licence && (
                <Text style={styles.licenceText}>License: {location.licence}</Text>
              )}
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
