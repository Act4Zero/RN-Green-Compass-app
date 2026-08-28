import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { format } from 'date-fns';
import ViewShot, { ViewShotProperties } from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';

interface LeaderboardShareableCardProps {
  rank: number;
  displayName: string;
  totalPoints?: number;
  leaderboardType: 'points' | 'streak';
  longestStreak?: number;
  currentStreak?: number;
  totalEntries?: number;
  theme?: 'light' | 'dark';
  viewShotRef?: React.RefObject<ViewShot>;
  viewShotOptions?: ViewShotProperties;
}

/**
 * ShareableCard component for rendering leaderboard achievements in a shareable format
 */
export function LeaderboardShareableCard({
  rank,
  displayName,
  totalPoints,
  leaderboardType,
  longestStreak,
  currentStreak,
  totalEntries,
  theme: forcedTheme,
  viewShotRef,
  viewShotOptions = {}
}: LeaderboardShareableCardProps) {
  // Always use light theme
  const theme: 'light' | 'dark' = 'light';
  const defaultRef = useRef<ViewShot>(null);
  const ref = viewShotRef || defaultRef;
  
  // Format date for the card
  const currentDate = new Date();
  const formattedDate = format(currentDate, 'MMM d, yyyy');
  
  // Get medal icon based on rank
  const getMedalIcon = () => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'ribbon';
    return 'stats-chart';
  };
  
  // Get rank color based on position
  const getRankColor = () => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#2E7D32'; // Default green
  };

  return (
    <ViewShot 
      ref={ref} 
      options={{
        format: 'jpg',
        quality: 0.9,
        result: 'data-uri',
        ...viewShotOptions
      }}
      style={styles.container}
    >
      <View style={styles.cardContent}>
        {/* Leaderboard Status */}
        <View style={styles.rankContainer}>
          <Ionicons 
            name={getMedalIcon() as any} 
            size={28} 
            color={getRankColor()}
          />
          <Text style={[
            styles.rankText,
            { color: getRankColor() }
          ]}>
            #{rank}
          </Text>
          
          <Text style={styles.rankLabel}>
            {leaderboardType === 'points' ? 'Impact Leaderboard' : 'Streak Leaderboard'}
            {totalEntries ? ` (of ${totalEntries})` : ''}
          </Text>
        </View>
        
        {/* User Name */}
        <Text style={styles.userName}>
          {displayName}
        </Text>
        
        {/* Achievement Stats */}
        <View style={styles.statsContainer}>
          {leaderboardType === 'points' && (
            <View style={styles.statItem}>
              <Ionicons name="star" size={20} color="#2E7D32" />
              <Text style={styles.statValue}>
                {totalPoints || 0} points
              </Text>
            </View>
          )}
          
          {leaderboardType === 'streak' && (
            <>
              <View style={styles.statItem}>
                <Ionicons name="flame" size={20} color="#2E7D32" />
                <Text style={styles.statValue}>
                  {longestStreak || 0} day longest streak
                </Text>
              </View>
              
              {currentStreak !== undefined && currentStreak > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name="timer-outline" size={20} color="#2E7D32" />
                  <Text style={styles.statValue}>
                    {currentStreak} day current streak
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
        
        {/* Date */}
        <Text style={styles.dateText}>
          {formattedDate}
        </Text>
        
        {/* Motivational Message */}
        <View style={styles.motivationalContainer}>
          <Text style={styles.motivationalText}>
            Join me in making sustainable choices every day!
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Image 
          source={require('../../../../assets/images/GCLogo-rich-premium-original-shape.png')}
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.appName}>
          Green Compass
        </Text>
      </View>
    </ViewShot>
  );
}

/**
 * Captures the LeaderboardShareableCard as an image
 * 
 * @param ref ViewShot ref to capture
 * @returns Promise with the image URI
 */
export const captureLeaderboardShareableCard = async (ref: React.RefObject<ViewShot>): Promise<string | null> => {
  if (!ref.current) {
    console.error('ViewShot ref is not available');
    return null;
  }
  
  try {
    // Use viewshot's capture method with type checking
    if (typeof ref.current.capture === 'function') {
      const uri = await ref.current.capture();
      return uri;
    }
    console.error('ViewShot capture method not available');
    return null;
  } catch (error) {
    console.error('Error capturing card:', error);
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    marginBottom: 12,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 10,
    marginRight: 12,
  },
  rankLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  statsContainer: {
    marginVertical: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
  },
  motivationalContainer: {
    marginTop: 12,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  motivationalText: {
    fontSize: 14,
    color: '#2E7D32',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
    marginTop: 4,
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2E7D32',
  }
});

export default LeaderboardShareableCard;
