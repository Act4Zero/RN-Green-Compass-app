import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Share,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import useUserDisplayName from '@/hooks/useUserDisplayName';
import ShareButton from '../sharing/ShareButton';
import { shareToSocialPlatform, SocialPlatform } from '../../utils/sharing/shareUtils';
import { useAppLocale } from '@/context/AppLocaleContext';

interface BadgeSummaryShareModalProps {
  isVisible: boolean;
  onClose: () => void;
  onError?: (error: string) => void;
  badgeData: {
    earnedBadgeCount: number;
    totalBadgeCount: number;
    recentBadgeNames: string[];
  };
  shareContent: {
    title: string;
    message: string;
    url?: string;
    imageUrl?: string;
  };
  userName?: string;
}

function BadgeSummaryShareModal({
  isVisible,
  onClose,
  onError,
  badgeData,
  shareContent,
}: BadgeSummaryShareModalProps) {
  const { locale, t } = useAppLocale();
  const viewShotRef = useRef<ViewShot>(null);
  const { displayName } = useUserDisplayName();
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const handleClose = () => {
    onClose();
  };

  // Capture image and return its URI
  const captureImage = async (): Promise<string> => {
    if (!viewShotRef.current || !viewShotRef.current.capture) {
      throw new Error('ViewShot reference not available');
    }
    
    const uri = await viewShotRef.current.capture() || '';
    if (!uri) {
      throw new Error('Failed to capture image');
    }
    
    if (Platform.OS === 'web') {
      return uri;
    }
    
    // For native platforms, save to file system for sharing
    const fileUri = `${FileSystem.cacheDirectory}badge-summary-share.png`;
    await FileSystem.copyAsync({ from: uri, to: fileUri });
    return fileUri;
  };

  // Handle sharing to a specific platform
  const handleShare = async (platform: SocialPlatform) => {
    try {
      setIsSharing(true);
      setShareResult({});

      // Create share content with the display name - using the user's name if available
      const userName = displayName || t('I', 'Аз');
      const possessiveSuffix = displayName ? 'has' : 've';
      
      // Create a single message format without duplication
      // Preserve the original title and URL while customizing just the message
      const content: {
        title: string;
        url?: string;
        message: string;
        imageUrl?: string;
      } = {
        title: shareContent.title,
        url: 'https://app.greencompass.app', // Correct app URL
        message: locale === 'bg'
          ? `${userName} спечели ${badgeData.earnedBadgeCount} от ${badgeData.totalBadgeCount} значки в Green Compass! Присъедини се към движението за устойчив начин на живот.`
          : `${userName} ${possessiveSuffix} earned ${badgeData.earnedBadgeCount} of ${badgeData.totalBadgeCount} badges on Green Compass! Join the movement for sustainable living.`
      };

      // Capture image for all sharing platforms
      try {
        const imageUri = await captureImage();
        content.imageUrl = imageUri;
      } catch (imageError) {
        console.warn('Could not capture image for sharing:', imageError);
      }

      // Share to the selected platform
      const result = await shareToSocialPlatform(content, platform);

      if (result.success) {
        setShareResult({
          success: true,
          message: t('Successfully shared!', 'Споделено успешно!')
        });

        // Auto close after successful share with a slight delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setShareResult({
          success: false,
          message: locale === 'bg' ? 'Споделянето е неуспешно. Опитайте отново.' : result.error || 'Failed to share. Please try again.'
        });
      }
    } catch (error) {
      setShareResult({
        success: false,
        message: locale === 'bg' ? 'Възникна грешка при споделянето.' : error instanceof Error ? error.message : 'Unknown error occurred'
      });
      if (onError) {
        onError(error instanceof Error ? error.message : String(error));
      }
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  // Calculate completion percentage
  const completionPercentage = Math.round((badgeData.earnedBadgeCount / badgeData.totalBadgeCount) * 100);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('Share Badge Achievements', 'Споделяне на постиженията')}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#444" />
            </TouchableOpacity>
          </View>

          <View style={styles.sharePreviewContainer}>
            <ViewShot 
              ref={viewShotRef} 
              options={{ format: 'png', quality: 1 }}
              style={styles.viewShot}
            >
              <View style={styles.shareCard}>
                <View style={styles.shareCardHeader}>
                  <Text style={styles.shareCardTitle}>{t('Badge Achievements', 'Постижения със значки')}</Text>
                  <View style={styles.logoContainer}>
                    <Ionicons name="leaf" size={24} color="#2E7D32" />
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      <Text style={styles.progressHighlight}>{badgeData.earnedBadgeCount}</Text>
                      {t(' of ', ' от ')}
                      <Text style={styles.totalBadges}>{badgeData.totalBadgeCount}</Text>
                      {t(' badges earned', ' спечелени значки')}
                    </Text>
                    <Text style={styles.progressPercentage}>{completionPercentage}% {t('Complete', 'завършено')}</Text>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        {width: `${completionPercentage}%`}
                      ]} 
                    />
                  </View>
                </View>
                
                {badgeData.recentBadgeNames.length > 0 && (
                  <View style={styles.recentBadgesContainer}>
                    <Text style={styles.recentBadgesTitle}>{t('Recent Achievements:', 'Последни постижения:')}</Text>
                    {badgeData.recentBadgeNames.map((name, index) => (
                      <View key={index} style={styles.badgeItem}>
                        <Ionicons name="trophy" size={14} color="#2E7D32" style={{marginRight: 6}} />
                        <Text style={styles.badgeName}>{name}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={styles.shareCardFooter}>
                  {displayName ? (
                    <Text style={styles.footerText}>{t(`${displayName}'s sustainability journey`, `Устойчивият път на ${displayName}`)}</Text>
                  ) : (
                    <Text style={styles.footerText}>{t('My sustainability journey', 'Моят път към устойчивостта')}</Text>
                  )}
                  <Text style={styles.appPromo}>{t('via Green Compass App', 'чрез Green Compass')}</Text>
                </View>
              </View>
            </ViewShot>
          </View>

          <View style={styles.shareOptionsContainer}>
            <Text style={styles.shareOptionsTitle}>{t('Share to:', 'Сподели чрез:')}</Text>
            
            {isSharing ? (
              <ActivityIndicator size="large" color="#2E7D32" />
            ) : (
              <View style={styles.shareButtonsContainer}>
                <View style={styles.platformRow}>
                  <View style={styles.buttonContainer}>
                    <ShareButton
                      label="Twitter"
                      platformIcon="twitter"
                      onPress={() => handleShare('twitter')}
                      disabled={isSharing}
                    />
                  </View>
                  <View style={styles.buttonContainer}>
                    <ShareButton
                      label="LinkedIn"
                      platformIcon="linkedin"
                      onPress={() => handleShare('linkedin')}
                      disabled={isSharing}
                    />
                  </View>
                </View>
                <View style={styles.platformRow}>
                  <View style={styles.buttonContainer}>
                    <ShareButton
                      label={t('General', 'Други')}
                      platformIcon="general"
                      onPress={() => handleShare('general')}
                      disabled={isSharing}
                    />
                  </View>
                </View>
              </View>
            )}
            
            {shareResult.success && (
              <Text style={styles.successMessage}>{shareResult.message}</Text>
            )}
            
            {shareResult.success === false && shareResult.message && (
              <Text style={styles.errorMessage}>{shareResult.message}</Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
  },
  sharePreviewContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  viewShot: {
    width: '100%',
  },
  shareCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  shareCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  shareCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#EAF6EA',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#444',
  },
  progressHighlight: {
    fontWeight: 'bold',
    color: '#2E7D32',
    fontSize: 18,
  },
  totalBadges: {
    color: '#666',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  progressBarContainer: {
    backgroundColor: '#E8F5E9',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: '#2E7D32',
    height: '100%',
    borderRadius: 4,
  },
  recentBadgesContainer: {
    marginBottom: 20,
  },
  recentBadgesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 14,
    color: '#444',
  },
  shareCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  appPromo: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  shareOptionsContainer: {
    marginTop: 10,
  },
  shareOptionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 15,
  },
  shareButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 15,
    width: '100%',
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 2,
    minWidth: 64,
  },
  successMessage: {
    marginTop: 12,
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  errorMessage: {
    marginTop: 12,
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default BadgeSummaryShareModal;
