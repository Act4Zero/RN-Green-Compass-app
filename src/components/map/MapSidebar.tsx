import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import { LocationCategory } from '../../types/map';

// Category definitions with icons and colors
const categoryConfig: Record<LocationCategory, { icon: string; color: string; label: string }> = {
  'EV Charging Stations': { 
    icon: 'flash', 
    color: '#4CAF50', 
    label: 'EV Charging' 
  },
  'Recycling': { 
    icon: 'refresh-circle', 
    color: '#2196F3', 
    label: 'Recycling' 
  },
  'Organic Food': { 
    icon: 'leaf', 
    color: '#8BC34A', 
    label: 'Organic' 
  },
  'Zero-Waste': { 
    icon: 'trash-bin-outline', 
    color: '#FF9800', 
    label: 'Zero-Waste' 
  },
  'Green Building': { 
    icon: 'home', 
    color: '#9C27B0', 
    label: 'Green Building' 
  },
  'Community': { 
    icon: 'people', 
    color: '#E91E63', 
    label: 'Community' 
  },
};

export default function MapSidebar() {
  const { width } = useWindowDimensions();
  const { filters, toggleCategory, toggleAllCategories } = useMapIntegration();
  const isWideScreen = width > 768;

  // Animation for deep-linked categories (simulated pulse)
  useEffect(() => {
    // Check for utm_source=landing in URL query params
    const url = new URL(window.location.href);
    const utmSource = url.searchParams.get('utm_source');
    
    if (utmSource === 'landing') {
      // Would implement pulse animation here
      console.log('Category chips should pulse for 2 seconds');
    }
  }, []);

  const renderCategoryChips = () => {
    return Object.entries(categoryConfig).map(([category, config]) => {
      const isActive = filters[category as LocationCategory];
      
      return (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryChip,
            isActive ? { backgroundColor: config.color } : styles.inactiveChip
          ]}
          onPress={() => toggleCategory(category as LocationCategory, !isActive)}
        >
          <Ionicons
            name={config.icon as any}
            size={18}
            color={isActive ? '#FFFFFF' : config.color}
          />
          <Text style={[
            styles.chipText,
            isActive ? styles.activeChipText : { color: '#333333' }
          ]}>
            {config.label}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const renderToggleAll = () => {
    const areAllActive = Object.values(filters).every(Boolean);
    
    return (
      <TouchableOpacity
        style={[
          styles.toggleAllButton,
          areAllActive ? styles.toggleAllActive : styles.toggleAllInactive
        ]}
        onPress={() => toggleAllCategories(!areAllActive)}
      >
        <Text style={areAllActive ? styles.toggleAllActiveText : styles.toggleAllInactiveText}>
          {areAllActive ? 'Hide All' : 'Show All'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderLegend = () => {
    return (
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        {Object.entries(categoryConfig).map(([category, config]) => (
          <View key={category} style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: config.color }]}>
              <Ionicons name={config.icon as any} size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.legendText}>{config.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      isWideScreen ? styles.wideContainer : styles.narrowContainer
    ]}>
      <Text style={styles.title}>Sustainability Map</Text>
      
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Categories</Text>
        <ScrollView 
          horizontal={!isWideScreen}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          {renderCategoryChips()}
        </ScrollView>
        
        {renderToggleAll()}
      </View>
      
      {isWideScreen && renderLegend()}
    </View>
  );
}

interface Styles {
  container: React.CSSProperties | any;
  wideContainer: React.CSSProperties | any;
  narrowContainer: React.CSSProperties | any;
  title: React.CSSProperties | any;
  filterSection: React.CSSProperties | any;
  filterTitle: React.CSSProperties | any;
  chipContainer: React.CSSProperties | any;
  categoryChip: React.CSSProperties | any;
  inactiveChip: React.CSSProperties | any;
  chipText: React.CSSProperties | any;
  activeChipText: React.CSSProperties | any;
  toggleAllButton: React.CSSProperties | any;
  toggleAllActive: React.CSSProperties | any;
  toggleAllInactive: React.CSSProperties | any;
  toggleAllActiveText: React.CSSProperties | any;
  toggleAllInactiveText: React.CSSProperties | any;
  legend: React.CSSProperties | any;
  legendTitle: React.CSSProperties | any;
  legendItem: React.CSSProperties | any;
  legendIcon: React.CSSProperties | any;
  legendText: React.CSSProperties | any;
}

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  wideContainer: {
    width: 260,
    minHeight: '100%',
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
  },
  narrowContainer: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2E7D32', // Green color consistent with the app theme
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  inactiveChip: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  toggleAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  toggleAllActive: {
    backgroundColor: '#2E7D32',
  },
  toggleAllInactive: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleAllActiveText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  toggleAllInactiveText: {
    color: '#333333',
    fontWeight: '500',
  },
  legend: {
    marginTop: 24,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333333',
  },
});
