import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { BadgeCategoryType } from '@/types/community/badges';
import BadgeItem from './BadgeItem';

interface BadgeListProps {
  title: string;
  badges: Array<any>;
  availableCategories: BadgeCategoryType[];
  selectedCategory: BadgeCategoryType | 'all';
  onSelectCategory: (category: BadgeCategoryType | 'all') => void;
  emptyMessage: string;
}

function BadgeList({
  title,
  badges,
  availableCategories,
  selectedCategory,
  onSelectCategory,
  emptyMessage
}: BadgeListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      
      {/* Category filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterScrollView}
      >
        {/* All filter */}
        <TouchableOpacity 
          style={[
            styles.filterChip, 
            selectedCategory === 'all' && styles.filterChipActive
          ]}
          onPress={() => onSelectCategory('all')}
        >
          <Text 
            style={[
              styles.filterChipText, 
              selectedCategory === 'all' && styles.filterChipTextActive
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {/* Category-specific filters */}
        {availableCategories.map(category => (
          <TouchableOpacity 
            key={category}
            style={[
              styles.filterChip, 
              selectedCategory === category && styles.filterChipActive
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text 
              style={[
                styles.filterChipText, 
                selectedCategory === category && styles.filterChipTextActive
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Badge items */}
      <View style={styles.badgeList}>
        {badges.length > 0 ? (
          badges.map((badge, index) => (
            <BadgeItem
              key={`${badge.code}-${index}`}
              name={badge.name}
              description={badge.description}
              imageUrl={badge.imageUrl}
              isEarned={badge.isEarned}
              category={badge.category}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{emptyMessage}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface Styles {
  container: ViewStyle;
  sectionTitle: TextStyle;
  filterScrollView: ViewStyle;
  filterChip: ViewStyle;
  filterChipActive: ViewStyle;
  filterChipText: TextStyle;
  filterChipTextActive: TextStyle;
  badgeList: ViewStyle;
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    width: '100%' as any,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  filterScrollView: {
    flexDirection: 'row',
    paddingVertical: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  filterChipText: {
    color: '#555555',
  },
  filterChipTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  badgeList: {
    width: '100%',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  emptyStateText: {
    color: '#888888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default BadgeList;
