import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Challenge } from '@/types/challenge';
import ChallengeStyles from '@/styles/community/ChallengeStyles';
import formatDate from '../../utils/formatDate';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;
}

const styles = ChallengeStyles;

function ChallengeCard({ challenge, onPress }: ChallengeCardProps) {
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

  return (
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
          {challenge.participant_count} participants
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default ChallengeCard;
