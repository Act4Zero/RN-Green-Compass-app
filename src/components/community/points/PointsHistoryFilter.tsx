import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { PointSource } from '@/types/community/points';
import { formatPointSource } from '@/utils/pointsFormatters';
import pointsStyles from '@/styles/community/Points.styles';

interface PointsHistoryFilterProps {
  activeFilters: PointSource[];
  availableSources: PointSource[];
  onToggleFilter: (source: PointSource) => void;
  onClearFilters: () => void;
}

function PointsHistoryFilter({
  activeFilters,
  availableSources,
  onToggleFilter,
  onClearFilters
}: PointsHistoryFilterProps) {
  return (
    <View style={pointsStyles.filterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={pointsStyles.filterScrollView}
      >
        {/* All filter */}
        <TouchableOpacity 
          style={[
            pointsStyles.filterChip, 
            activeFilters.length === 0 && pointsStyles.filterChipActive
          ]}
          onPress={onClearFilters}
        >
          <Text 
            style={[
              pointsStyles.filterChipText, 
              activeFilters.length === 0 && pointsStyles.filterChipTextActive
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {/* Source-specific filters */}
        {availableSources.map(source => (
          <TouchableOpacity 
            key={source}
            style={[
              pointsStyles.filterChip, 
              activeFilters.includes(source) && pointsStyles.filterChipActive
            ]}
            onPress={() => onToggleFilter(source)}
          >
            <Text 
              style={[
                pointsStyles.filterChipText, 
                activeFilters.includes(source) && pointsStyles.filterChipTextActive
              ]}
            >
              {formatPointSource(source)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default PointsHistoryFilter;
