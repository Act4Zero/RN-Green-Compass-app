import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          <Text style={styles.title}>{location.name}</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color="#666666" style={styles.infoIcon} />
            <Text style={styles.infoText}>{address}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="pricetag" size={16} color="#666666" style={styles.infoIcon} />
            <Text style={styles.infoText}>{location.category}</Text>
          </View>
          
          {location.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{location.description}</Text>
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
              <Text style={styles.sourceText}>Source: {location.source}</Text>
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

interface Styles {
  popupContainer: React.CSSProperties | any;
  popup: React.CSSProperties | any;
  closeButton: React.CSSProperties | any;
  header: React.CSSProperties | any;
  categoryIcon: React.CSSProperties | any;
  title: React.CSSProperties | any;
  content: React.CSSProperties | any;
  infoRow: React.CSSProperties | any;
  infoIcon: React.CSSProperties | any;
  infoText: React.CSSProperties | any;
  descriptionContainer: React.CSSProperties | any;
  descriptionText: React.CSSProperties | any;
  sourceContainer: React.CSSProperties | any;
  sourceText: React.CSSProperties | any;
  navigationButton: React.CSSProperties | any;
  navigationText: React.CSSProperties | any;
}

const styles = StyleSheet.create<Styles>({
  popupContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    zIndex: 100,
  },
  popup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  sourceContainer: {
    marginTop: 8,
  },
  sourceText: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 4,
  },
  navigationText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});
