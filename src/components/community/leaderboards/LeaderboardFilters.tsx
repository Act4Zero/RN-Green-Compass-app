import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LeaderboardFilterType, LeaderboardType } from '@/types/leaderboards';
import { formatFilterTypeLabel, formatLeaderboardTypeLabel } from '@/utils/leaderboardUtils';
import LeaderboardStyles from '@/styles/LeaderboardStyles';

interface LeaderboardFiltersProps {
  filter: {
    type: LeaderboardType;
    scope: LeaderboardFilterType;
  };
  availableScopes: LeaderboardFilterType[];
  setLeaderboardType: (type: LeaderboardType) => void;
  setLeaderboardScope: (scope: LeaderboardFilterType) => void;
}

function LeaderboardFilters({
  filter,
  availableScopes,
  setLeaderboardType,
  setLeaderboardScope,
}: LeaderboardFiltersProps) {
  const styles = LeaderboardStyles;

  return (
    <View style={styles.filtersContainer}>
      {/* Leaderboard Type Filters */}
      <View style={styles.filterTypeContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter.type === 'points' && styles.filterButtonActive,
          ]}
          onPress={() => setLeaderboardType('points')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter.type === 'points' && styles.filterButtonActiveText,
            ]}
          >
            {formatLeaderboardTypeLabel('points')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter.type === 'streak' && styles.filterButtonActive,
          ]}
          onPress={() => setLeaderboardType('streak')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter.type === 'streak' && styles.filterButtonActiveText,
            ]}
          >
            {formatLeaderboardTypeLabel('streak')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard Scope Filters */}
      <View style={styles.filterTypeContainer}>
        {availableScopes.map((scope) => (
          <TouchableOpacity
            key={scope}
            style={[
              styles.filterButton,
              filter.scope === scope && styles.filterButtonActive,
            ]}
            onPress={() => setLeaderboardScope(scope)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter.scope === scope && styles.filterButtonActiveText,
              ]}
            >
              {formatFilterTypeLabel(scope)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default LeaderboardFilters;
