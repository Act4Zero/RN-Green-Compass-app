import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatBadgeSummaryForSharing } from '@/utils/sharing/badgeShareUtils';
import BadgeSummaryShareModal from '@/components/badges/BadgeSummaryShareModal';
import { useAppLocale } from '@/context/AppLocaleContext';

interface BadgeSummaryProps {
  badgeCount: number;
  totalBadgeCount: number;
  recentBadgeNames?: string[];
  userName?: string;
}

function BadgeSummary({ badgeCount, totalBadgeCount, recentBadgeNames = [], userName }: BadgeSummaryProps) {
  const router = useRouter();
  const { t } = useAppLocale();
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  
  // Prepare the sharing content
  const shareContent = formatBadgeSummaryForSharing(
    badgeCount,
    totalBadgeCount,
    recentBadgeNames,
    userName
  );
  
  // Badge data for the share modal
  const badgeData = {
    earnedBadgeCount: badgeCount,
    totalBadgeCount,
    recentBadgeNames
  };

  const handleViewAllBadges = useCallback(() => {
    router.push('/profile/badges' as any);
  }, [router]);
  
  const handleSharePress = useCallback(() => {
    setIsShareModalVisible(true);
  }, []);
  
  const handleCloseShareModal = useCallback(() => {
    setIsShareModalVisible(false);
  }, []);
  
  const handleShareError = useCallback((error: string) => {
    Alert.alert(
      t('Sharing Error', 'Грешка при споделяне'),
      t('There was a problem sharing your badge achievements. Please try again.', 'Възникна проблем при споделянето на постиженията. Опитайте отново.')
    );
    console.error('Error sharing badges:', error);
  }, [t]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.summaryHeader}>
          <View style={styles.titleContainer}>
            <Ionicons name="trophy" size={20} color="#2E7D32" style={{marginRight: 8}} />
            <Text style={styles.title}>{t('Achievements', 'Постижения')}</Text>
          </View>
          <View style={styles.badgeActions}>
            <Text style={styles.count}>
              {badgeCount} {t(badgeCount === 1 ? 'badge earned' : 'badges earned', badgeCount === 1 ? 'спечелена значка' : 'спечелени значки')}
            </Text>
            {badgeCount > 0 && (
              <TouchableOpacity 
                style={styles.shareButton} 
                onPress={handleSharePress}
                accessibilityLabel={t('Share badge achievements', 'Сподели постиженията')}
              >
                <Ionicons name="share-social-outline" size={18} color="#2E7D32" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.viewAllButton} 
          onPress={handleViewAllBadges}
        >
          <Text style={styles.viewAllButtonText}>{t('View all badges', 'Виж всички значки')}</Text>
          <Ionicons name="chevron-forward" size={16} color="#2E7D32" />
        </TouchableOpacity>
      </View>
      
      {/* Share Modal */}
      <BadgeSummaryShareModal
        isVisible={isShareModalVisible}
        onClose={handleCloseShareModal}
        onError={handleShareError}
        badgeData={badgeData}
        shareContent={shareContent}
        userName={userName}
      />
    </>
  );
}

interface Styles {
  container: ViewStyle;
  summaryHeader: ViewStyle;
  titleContainer: ViewStyle;
  titleIcon: ViewStyle;
  title: TextStyle;
  count: TextStyle;
  viewAllButton: ViewStyle;
  viewAllButtonText: TextStyle;
  badgeActions: ViewStyle;
  shareButton: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  count: {
    fontSize: 14,
    color: '#666666',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  badgeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    marginLeft: 10,
    padding: 4,
    backgroundColor: '#EAF6EA',
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BadgeSummary;
