import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import styles from './DashboardStats.styles';
import { Ionicons } from '@expo/vector-icons';
import { homeStyles } from '../../styles/Home.styles';
import { ShareModal } from '@/components/sharing';
import { formatDashboardForSharing } from '@/utils/sharing/dashboardShareUtils';
import useUserDisplayName from '@/hooks/useUserDisplayName';


interface DashboardStatsProps {
  totalActions: number;
  totalCO2Saved: number;
  overallStreak: number;
}

export function DashboardStats({ totalActions, totalCO2Saved, overallStreak }: DashboardStatsProps) {
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const { displayName } = useUserDisplayName();
  
  // Format the current date for the achievement date
  const currentDate = new Date();
  
  // Get fallback values for potentially undefined props
  const safeActions = totalActions || 0;
  const safeCO2 = totalCO2Saved || 0;
  const safeStreak = overallStreak || 0;
  
  // Prepare achievement data for sharing
  const achievementData = {
    title: `${safeActions} Actions · ${safeCO2.toFixed(1)} kg CO₂ Saved · ${safeStreak} Day Streak`,
    date: currentDate,
    icon: undefined, // We could add a custom icon here in the future
  };
  
  // Create custom-formatted sharing content using display name from profile
  const shareContent = formatDashboardForSharing(
    safeActions,
    safeCO2,
    safeStreak,
    displayName
  );
  
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
      'There was a problem sharing your dashboard. Please try again.'
    );
  }, []);

  return (
    <>
      <View style={homeStyles.card}>
        <View style={styles.titleContainer}>
          <Text style={homeStyles.cardTitle}>Your Sustainability Dashboard</Text>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleSharePress}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" style={styles.shareIcon} size={22} />
          </TouchableOpacity>
        </View>
        
        <Text style={homeStyles.cardContent}>
          Track your progress and see how your actions are making a difference.
        </Text>

        <View style={homeStyles.statsContainer}>
          <View style={homeStyles.statItem}>
            <Text style={homeStyles.statValue}>{totalActions || 0}</Text>
            <Text style={homeStyles.statLabel}>Actions Taken</Text>
          </View>
          <View style={homeStyles.statItem}>
            <Text style={homeStyles.statValue}>{totalCO2Saved?.toFixed(1) || '0'}</Text>
            <Text style={homeStyles.statLabel}>CO₂ Saved (kg)</Text>
          </View>
          <View style={homeStyles.statItem}>
            <Text style={homeStyles.statValue}>{overallStreak || 0}</Text>
            <Text style={homeStyles.statLabel}>Streak Days</Text>
          </View>
        </View>
      </View>
      
      {/* Share Modal */}
      <ShareModal
        isVisible={isShareModalVisible}
        onClose={handleCloseShareModal}
        achievementData={{
          ...achievementData,
          // Add pre-formatted sharing content for messaging
          shareContent: shareContent
        }}
        showUserName={true}
      />
    </>
  );
}

export default DashboardStats;
