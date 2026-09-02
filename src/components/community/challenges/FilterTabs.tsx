import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ChallengeStyles from '@/styles/community/ChallengeStyles';
import { ChallengeFilter } from '@/hooks/challenge/types';
import { useAppLocale } from '@/context/AppLocaleContext';

interface FilterTabsProps {
  activeFilter: ChallengeFilter;
  onFilterChange: (filter: ChallengeFilter) => void;
}

const styles = ChallengeStyles;

function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const { t } = useAppLocale();
  return (
    <View style={styles.filterTabs}>
      <TouchableOpacity
        style={activeFilter === 'all' ? styles.filterTabActive : styles.filterTab}
        onPress={() => onFilterChange('all')}
      >
        <Text style={activeFilter === 'all' ? styles.filterTabTextActive : styles.filterTabText}>
          {t('All', 'Всички')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={activeFilter === 'active' ? styles.filterTabActive : styles.filterTab}
        onPress={() => onFilterChange('active')}
      >
        <Text style={activeFilter === 'active' ? styles.filterTabTextActive : styles.filterTabText}>
          {t('Active', 'Активни')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={activeFilter === 'participating' ? styles.filterTabActive : styles.filterTab}
        onPress={() => onFilterChange('participating')}
      >
        <Text style={activeFilter === 'participating' ? styles.filterTabTextActive : styles.filterTabText}>
          {t('Mine', 'Моите')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={activeFilter === 'completed' ? styles.filterTabActive : styles.filterTab}
        onPress={() => onFilterChange('completed')}
      >
        <Text style={activeFilter === 'completed' ? styles.filterTabTextActive : styles.filterTabText}>
          {t('Completed', 'Завършени')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default FilterTabs;
