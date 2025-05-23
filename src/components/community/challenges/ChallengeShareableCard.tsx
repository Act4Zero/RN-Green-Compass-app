import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { format } from 'date-fns';
import ViewShot, { ViewShotProperties } from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';

interface ChallengeShareableCardProps {
  challengeTitle: string;
  challengeDescription: string;
  startDate: Date;
  endDate: Date;
  isParticipant: boolean;
  participantCount: number;
  progressMetric?: number;
  theme?: 'light' | 'dark';
  viewShotRef?: React.RefObject<ViewShot>;
  viewShotOptions?: ViewShotProperties;
}

/**
 * ShareableCard component for rendering challenges in a shareable format
 */
export function ChallengeShareableCard({
  challengeTitle,
  challengeDescription,
  startDate,
  endDate,
  isParticipant,
  participantCount,
  progressMetric,
  theme: forcedTheme,
  viewShotRef,
  viewShotOptions = {}
}: ChallengeShareableCardProps) {
  // Always use light theme
  const theme: 'light' | 'dark' = 'light';
  const defaultRef = useRef<ViewShot>(null);
  const ref = viewShotRef || defaultRef;
  
  // Format dates
  const formatDateStr = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };
  
  const startDateStr = formatDateStr(startDate);
  const endDateStr = formatDateStr(endDate);
  
  // Check if challenge is active
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;
  const hasEnded = now > endDate;
  
  // Get status label and color
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
    
    if (isParticipant) {
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

  // Truncate description if too long
  const truncatedDescription = challengeDescription.length > 120
    ? `${challengeDescription.substring(0, 120).trim()}...`
    : challengeDescription;

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
        {/* Challenge Status */}
        <View style={styles.statusContainer}>
          <Ionicons 
            name={statusInfo.icon as any} 
            size={16} 
            color={statusInfo.color} 
          />
          <Text style={[
            styles.statusText,
            { color: statusInfo.color }
          ]}>
            {statusInfo.label}
          </Text>
        </View>
        
        {/* Challenge Title */}
        <Text style={styles.title}>
          {challengeTitle}
        </Text>
        
        {/* Date Range */}
        <Text style={styles.dateRange}>
          {startDateStr} - {endDateStr}
        </Text>
        
        {/* Challenge Description */}
        <Text style={styles.description}>
          {truncatedDescription}
        </Text>
        
        {/* Participation Info */}
        <View style={styles.participationInfo}>
          <View style={styles.participantContainer}>
            <Ionicons name="people" size={16} color="#2E7D32" />
            <Text style={styles.participantText}>
              {participantCount} participants
            </Text>
          </View>
          
          {/* Progress bar if user is participating */}
          {isParticipant && progressMetric !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, progressMetric)}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {progressMetric}% complete
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.footer}>
        <Image 
          source={require('../../../../assets/images/GCLogo-no-bg.png')} 
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
 * Captures the ChallengeShareableCard as an image
 * 
 * @param ref ViewShot ref to capture
 * @returns Promise with the image URI
 */
export const captureChallengeShareableCard = async (ref: React.RefObject<ViewShot>): Promise<string | null> => {
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    marginBottom: 16,
  },
  participationInfo: {
    marginTop: 8,
  },
  participantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantText: {
    fontSize: 14,
    color: '#555555',
    marginLeft: 6,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E7D32',
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

export default ChallengeShareableCard;
