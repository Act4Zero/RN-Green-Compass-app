import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Challenge } from '@/types/community/challenge';
import ChallengeStyles from '@/styles/community/ChallengeStyles';
import cardStyles from './ChallengeCard.styles';
import { formatChallengeForSharing } from '@/utils/sharing/challengeShareUtils';
import ChallengeShareModal from './ChallengeShareModal';
import { useAuth } from '@/context/AuthContext';
import formatDate from '@/utils/formatDate';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;
}

const styles = ChallengeStyles;

function ChallengeCard({ challenge, onPress }: ChallengeCardProps) {
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const { user } = useAuth();
  
  // Format the dates for display
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const dateString = `${formatDate(startDate)} - ${formatDate(endDate)}`;
  
  // Check if challenge is active
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;
  const hasEnded = now > endDate;
  
  // Get status label and icon
  const getStatusInfo = () => {
    if (hasEnded) {
      return { 
        label: 'Completed',
        icon: 'checkmark-circle',
        color: '#9E9E9E'
      };
    }
    
    if (!isActive) {
      return {
        label: 'Upcoming',
        icon: 'time',
        color: '#FFB74D'
      };
    }
    
    if (challenge.is_participant) {
      return {
        label: 'Participating',
        icon: 'people',
        color: '#2E7D32'
      };
    }
    
    return {
      label: 'Active',
      icon: 'flame',
      color: '#4CAF50'
    };
  };
  
  const statusInfo = getStatusInfo();
  
  // Get user display name with a fallback
  const userName = user?.email ? user.email.split('@')[0] : undefined;
  
  // Create custom-formatted sharing content for the challenge
  const shareContent = formatChallengeForSharing(
    challenge.title,
    challenge.description,
    startDate,
    endDate,
    Boolean(challenge.is_participant),
    challenge.participant_count || 0,
    challenge.progress_metric,
    userName
  );
  
  // Prepare challenge data for sharing modal
  const challengeData = {
    title: challenge.title,
    description: challenge.description,
    startDate,
    endDate,
    isParticipant: Boolean(challenge.is_participant),
    participantCount: challenge.participant_count || 0,
    progressMetric: challenge.progress_metric,
    shareContent
  };
  
  // Handle opening the share modal - only available for active challenges or completed ones
  const handleSharePress = useCallback((e: GestureResponderEvent) => {
    e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
    
    // Only allow sharing active challenges or completed ones
    const now = new Date();
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    const isActive = now >= startDate && now <= endDate;
    const hasEnded = now > endDate;
    
    if (isActive || hasEnded) {
      setIsShareModalVisible(true);
    } else {
      Alert.alert(
        'Sharing Unavailable',
        'You can only share active or completed challenges.',
        [{ text: 'OK' }]
      );
    }
  }, [challenge.start_date, challenge.end_date]);
  
  // Handle closing the share modal
  const handleCloseShareModal = useCallback(() => {
    setIsShareModalVisible(false);
  }, []);
  
  // Handle share error
  const handleShareError = useCallback((error: string) => {
    Alert.alert(
      'Sharing Error',
      'There was a problem sharing this challenge. Please try again.'
    );
  }, []);

  return (
    <>
      <TouchableOpacity style={styles.challengeCard} onPress={onPress}>
        <View style={styles.challengeHeader}>
          {/* Status Indicator */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
            <Text style={{ fontSize: 12, color: statusInfo.color, marginLeft: 4, fontWeight: '500' }}>
              {statusInfo.label}
            </Text>
          </View>
          
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
        </View>
        
        <Text style={styles.challengeDescription} numberOfLines={2}>
          {challenge.description}
        </Text>
        
        {/* Progress bar if user is participating */}
        {challenge.is_participant && (
          <View style={{ marginTop: 8 }}>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, challenge.progress_metric || 0)}%` }
                ]}
              />
            </View>
            <Text style={{ fontSize: 12, color: '#2E7D32', fontWeight: '500' }}>
              Your progress: {challenge.progress_metric || 0}%
            </Text>
          </View>
        )}
        
        <View style={styles.challengeMeta}>
          <Text style={styles.challengeDates}>{dateString}</Text>
          <Text style={styles.participantCount}>
            <Ionicons name="people" size={12} color="#2E7D32" /> {' '}
            {challenge.participant_count || 0} participants
          </Text>
          
          {/* Share Button - visually indicate if sharing is available */}
          <View style={cardStyles.buttonRow}>
            <TouchableOpacity 
              style={[cardStyles.shareButton, 
                !(isActive || hasEnded) && cardStyles.disabledShareButton
              ]}
              onPress={handleSharePress}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="share-social" 
                style={[cardStyles.shareIcon, 
                  !(isActive || hasEnded) && cardStyles.disabledShareIcon
                ]} 
              />
              <Text style={[cardStyles.shareButtonText, 
                !(isActive || hasEnded) && cardStyles.disabledShareButtonText
              ]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Challenge Share Modal */}
      <ChallengeShareModal
        isVisible={isShareModalVisible}
        onClose={handleCloseShareModal}
        challengeData={challengeData}
      />
    </>
  );
}

export default ChallengeCard;
