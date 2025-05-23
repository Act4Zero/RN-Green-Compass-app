import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { shareModalStyles } from '../../styles/shareModalStyles';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import ShareableCard, { ShareableCardProps, captureShareableCard } from './ShareableCard';
import ShareButton from './ShareButton';
import { 
  shareToSocialPlatform, 
  SocialPlatform, 
  formatAchievementForSharing, 
  getAvailableSocialPlatforms 
} from '../../utils/sharing/shareUtils';
import useUserDisplayName from '@/hooks/useUserDisplayName';

// Using styles from shareModalStyles.ts

export interface ShareModalProps {
  isVisible: boolean;
  onClose: () => void;
  achievementData: {
    title: string;
    date: Date;
    icon?: string;
    shareContent?: {
      title: string;
      message: string;
      url?: string;
      imageUrl?: string;
    };
  };
  showUserName?: boolean;
}

/**
 * Modal for sharing achievements to social platforms
 */
export function ShareModal({
  isVisible,
  onClose,
  achievementData,
  showUserName = false
}: ShareModalProps) {
  const { displayName } = useUserDisplayName();

  const { width } = useWindowDimensions();
  const cardRef = useRef<ViewShot>(null);
  
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  
  const [availablePlatforms, setAvailablePlatforms] = useState<SocialPlatform[]>([]);
  
  // Get available platforms on component mount
  useEffect(() => {
    setAvailablePlatforms(getAvailableSocialPlatforms());
  }, []);

  // Format achievement data for the ShareableCard component
  const cardProps: ShareableCardProps = {
    achievementTitle: achievementData.title,
    achievementDate: achievementData.date,
    achievementIcon: achievementData.icon,
    userName: displayName,
    showUserName,
    theme: 'light',
    viewShotRef: cardRef
  };

  /**
   * Handle sharing to a specific platform
   * 
   * @param platform The social platform to share to
   */
  const handleShare = async (platform: SocialPlatform) => {
    try {
      setIsSharing(true);
      setShareResult({});

      // Use custom sharing content if provided, otherwise generate it
      const shareContent = achievementData.shareContent || formatAchievementForSharing(
        achievementData.title,
        showUserName ? displayName : undefined
      );

      // If we're on a mobile platform and need an image, capture the card
      if (Platform.OS !== 'web' && ['instagram'].includes(platform)) {
        const imageUri = await captureShareableCard(cardRef);
        if (imageUri) {
          shareContent.imageUrl = imageUri;
        }
      }

      // Share to the selected platform
      const result = await shareToSocialPlatform(shareContent, platform);

      if (result.success) {
        setShareResult({
          success: true,
          message: 'Successfully shared!'
        });

        // Auto close after successful share with a slight delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setShareResult({
          success: false,
          message: result.error || 'Failed to share. Please try again.'
        });
      }
    } catch (error) {
      setShareResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      Alert.alert('Sharing Error', 'Failed to share your achievement. Please try again later.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.contentWrapper}>
            <View style={styles.header}>
              <Text style={styles.title}>
                Share Your Achievement
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                disabled={isSharing}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardContainer}>
              <ShareableCard {...cardProps} />
            </View>


            <View style={styles.sharingOptions}>
              <Text style={styles.sharingOptionsTitle}>
                Share to:
              </Text>
              {isSharing ? (
                <ActivityIndicator size="large" color="#2E7D32" />
              ) : (
                <View style={styles.platformButtons}>
                  <View style={styles.platformRow}>
                    {availablePlatforms.includes('twitter') && (
                      <View style={styles.buttonContainer}>
                        <ShareButton
                          label="Twitter"
                          platformIcon="twitter"
                          onPress={() => handleShare('twitter')}
                          disabled={isSharing}
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.platformRow}>
                    {availablePlatforms.includes('linkedin') && (
                      <View style={styles.buttonContainer}>
                        <ShareButton
                          label="LinkedIn"
                          platformIcon="linkedin"
                          onPress={() => handleShare('linkedin')}
                          disabled={isSharing}
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.platformRow}>
                    <View style={styles.buttonContainer}>
                      <ShareButton
                        label="More Options"
                        platformIcon="general"
                        onPress={() => handleShare('general')}
                        disabled={isSharing}
                      />
                    </View>
                  </View>
                </View>
              )}

              {shareResult.success && (
                <Text style={styles.successMessage}>
                  {shareResult.message}
                </Text>
              )}

              {shareResult.success === false && (
                <Text style={styles.errorMessage}>
                  {shareResult.message}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = shareModalStyles;

export default ShareModal;
