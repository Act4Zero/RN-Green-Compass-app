import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotivationalInfo, LeaderboardType, LeaderboardFilterType } from '@/types/leaderboards';
import { formatLeaderboardForSharing } from '@/utils/leaderboardShareUtils';
import LeaderboardShareModal from './LeaderboardShareModal';
import styles from './MotivationalMessage.styles';
import LeaderboardStyles from '@/styles/LeaderboardStyles';

interface MotivationalMessageProps {
  motivationalInfo: MotivationalInfo;
  currentUserRank: number;
  displayName: string;
  totalPoints?: number;
  leaderboardType: LeaderboardType;
  leaderboardScope: LeaderboardFilterType;
  longestStreak?: number;
  currentStreak?: number;
  totalEntries?: number;
}

function MotivationalMessage({ 
  motivationalInfo,
  currentUserRank,
  displayName,
  totalPoints,
  leaderboardType,
  leaderboardScope,
  longestStreak,
  currentStreak,
  totalEntries
}: MotivationalMessageProps) {
  // State for controlling the share modal visibility
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  
  // Handle opening the share modal
  const handleSharePress = useCallback(() => {
    setIsShareModalVisible(true);
  }, []);
  
  // Handle closing the share modal
  const handleCloseShareModal = useCallback(() => {
    setIsShareModalVisible(false);
  }, []);
  
  // Handle share error
  const handleShareError = useCallback((error: string) => {
    Alert.alert(
      'Sharing Error',
      'There was a problem sharing your leaderboard ranking. Please try again.'
    );
  }, []);
  
  // If there's no message and user isn't ranked, don't render anything
  if (!motivationalInfo.message && (!currentUserRank || currentUserRank === 0)) {
    return null;
  }
  
  // Create formatted sharing content for the leaderboard
  const shareContent = formatLeaderboardForSharing(
    currentUserRank,
    displayName,
    totalPoints,
    leaderboardType,
    leaderboardScope,
    longestStreak,
    currentStreak,
    totalEntries,
    motivationalInfo.nextMilestone
  );
  
  // Prepare leaderboard data for sharing modal
  const leaderboardData = {
    rank: currentUserRank,
    displayName,
    totalPoints,
    leaderboardType,
    longestStreak,
    currentStreak,
    totalEntries,
    shareContent
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.messageWithButton}>
          <Text style={LeaderboardStyles.motivationalText}>
            {motivationalInfo.message || `You're ranked #${currentUserRank} on the ${leaderboardType === 'points' ? 'Impact' : 'Streak'} Leaderboard`}
          </Text>
        </View>
        
        {currentUserRank > 0 && (
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleSharePress}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social" size={16} style={styles.shareIcon} />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Leaderboard Share Modal */}
      <LeaderboardShareModal
        isVisible={isShareModalVisible}
        onClose={handleCloseShareModal}
        leaderboardData={leaderboardData}
      />
    </>
  );
}

export default MotivationalMessage;
