import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PointsLeaderboardEntry, StreakLeaderboardEntry, LeaderboardType } from '@/types/leaderboards';
import { shouldHighlightEntry } from '@/utils/leaderboardUtils';
import LeaderboardStyles from '@/styles/LeaderboardStyles';

interface LeaderboardEntryProps {
  entry: PointsLeaderboardEntry | StreakLeaderboardEntry;
  leaderboardType: LeaderboardType;
}

function LeaderboardEntry({ entry, leaderboardType }: LeaderboardEntryProps) {
  const styles = LeaderboardStyles;
  const isHighlighted = shouldHighlightEntry(entry);

  // Determine what value to display based on the leaderboard type
  const displayValue = 
    leaderboardType === 'points' 
      ? `${(entry as PointsLeaderboardEntry).totalPoints} pts` 
      : `${(entry as StreakLeaderboardEntry).longestStreak} days`;
  
  // Get the appropriate avatar display
  const getAvatarDisplay = () => {
    if (entry.avatar) {
      // If we had an image component, we would use it here
      // For now we'll use an icon placeholder
      return <Ionicons name="person" size={24} color="#2E7D32" />;
    }
    
    // Display initials if no avatar
    const initials = entry.displayName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    return <Text style={{ color: '#2E7D32', fontWeight: 'bold' }}>{initials}</Text>;
  };

  return (
    <View style={[
      styles.entryContainer,
      isHighlighted && styles.entryContainerHighlighted
    ]}>
      {/* Rank number */}
      <Text style={[
        styles.entryRank,
        isHighlighted && styles.entryRankHighlighted
      ]}>
        {entry.rank}
      </Text>
      
      {/* Avatar or initials */}
      <View style={styles.entryAvatar}>
        {getAvatarDisplay()}
      </View>
      
      {/* User name and score */}
      <View style={styles.entryContent}>
        <Text style={[
          styles.entryName,
          entry.isCurrentUser && styles.entryNameCurrent
        ]}>
          {entry.displayName}
        </Text>
        
        <Text style={[
          styles.entryValue,
          entry.isCurrentUser && styles.entryValueCurrent
        ]}>
          {displayValue}
        </Text>
      </View>
    </View>
  );
}

export default LeaderboardEntry;
