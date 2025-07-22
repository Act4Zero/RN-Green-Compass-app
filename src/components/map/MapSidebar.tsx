import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mapSidebarStyles } from '../../styles/map/MapSidebarStyles';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import { LocationCategory } from '../../types/map';
import { getAllCategoryConfigs } from '../../utils/categoryUtils';

// Get category configurations from central utility
const categoryConfig = getAllCategoryConfigs();

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
      

    </View>
  );
}

// Use the external styles imported from MapSidebarStyles
const styles = mapSidebarStyles;
