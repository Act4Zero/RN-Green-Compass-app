import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ChallengeStyles from '@/styles/ChallengeStyles';
import { ChallengeFilter } from '@/hooks/challenge/types';

interface FilterTabsProps {
  activeFilter: ChallengeFilter;
  onFilterChange: (filter: ChallengeFilter) => void;
}

const styles = ChallengeStyles;

function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <View style={styles.filterTabs}>
      <TouchableOpacity
        style={activeFilter === 'all' ? styles.filterTabActive : styles.filterTab}
        onPress={() => onFilterChange('all')}
      >
        <Text style={activeFilter === 'all' ? styles.filterTabTextActive : styles.filterTabText}>
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={activeFilter === 'active' ? styles.filterTabActive : styles.filterTab}
        onPress={() => onFilterChange('active')}
      >
        <Text style={activeFilter === 'active' ? styles.filterTabTextActive : styles.filterTabText}>
          Active
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={activeFilter === 'participating' ? styles.filterTabActive : styles.filterTab}
        onPress={() => onFilterChange('participating')}
      >
        <Text style={activeFilter === 'participating' ? styles.filterTabTextActive : styles.filterTabText}>
          Mine
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={activeFilter === 'completed' ? styles.filterTabActive : styles.filterTab}
        onPress={() => onFilterChange('completed')}
      >
        <Text style={activeFilter === 'completed' ? styles.filterTabTextActive : styles.filterTabText}>
          Completed
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default FilterTabs;
