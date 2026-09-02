import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HistoryStyles } from '@/styles/historyStyles';
import { ShareModal } from '@/components/sharing';
import { formatHabitHistoryForSharing } from '@/utils/sharing/habitHistoryShareUtils';
import { useAuth } from '@/context/AuthContext';
import statsStyles from './StatsContainer.styles';

interface StatsContainerProps {
  totalActions?: number;
  totalCO2Saved?: number;
  overallStreak?: number;
  styles: HistoryStyles;
  selectedDate?: Date | string | null;
}

export function StatsContainer({
  totalActions,
  totalCO2Saved,
  overallStreak,
  styles,
  selectedDate
}: StatsContainerProps) {
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const { user } = useAuth();
  
  // Format the current date for the achievement date
  const currentDate = new Date();
  
  // Get fallback values for potentially undefined props
  const safeActions = totalActions || 0;
  const safeCO2 = totalCO2Saved || 0;
  const safeStreak = overallStreak || 0;
  
  // Prepare achievement data for sharing
  const achievementData = {
    title: `${safeActions} действия · ${safeCO2.toFixed(1)} kg спестен CO₂ · ${safeStreak} дни поред`,
    date: currentDate,
    icon: undefined, // We could add a custom icon here in the future
  };
  
  // Get user display name with a fallback
  const userName = user?.email ? user.email.split('@')[0] : undefined;
  
  // Create custom-formatted sharing content
  const shareContent = formatHabitHistoryForSharing(
    safeActions,
    safeCO2,
    safeStreak,
    selectedDate,
    userName
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
      'Грешка при споделяне',
      'Историята на навиците не можа да бъде споделена. Опитай отново.'
    );
  }, []);
  return (
    <>
      <View style={statsStyles.headerContainer}>
        <Text style={styles.sectionTitle}>Твоята устойчива статистика</Text>
        <TouchableOpacity 
          style={statsStyles.shareButton}
          onPress={handleSharePress}
          activeOpacity={0.7}
        >
          <Ionicons name="share-social-outline" style={statsStyles.shareIcon} size={22} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalActions || 0}</Text>
          <Text style={styles.statLabel}>Извършени действия</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalCO2Saved?.toFixed(1) || '0'}</Text>
          <Text style={styles.statLabel}>Спестен CO₂ (kg)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{overallStreak || 0}</Text>
          <Text style={styles.statLabel}>Поредни дни</Text>
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

export default StatsContainer;
