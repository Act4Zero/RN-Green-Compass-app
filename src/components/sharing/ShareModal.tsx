import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ViewStyle,
  TextStyle,
  useColorScheme,
  useWindowDimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import ShareableCard, { ShareableCardProps, captureShareableCard } from './ShareableCard';
import ShareButton from './ShareButton';
import { shareToSocialPlatform, SocialPlatform, formatAchievementForSharing } from '../../utils/shareUtils';

interface Styles {
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  closeButton: ViewStyle;
  divider: ViewStyle;
  cardContainer: ViewStyle;
  sharingOptions: ViewStyle;
  sharingOptionsTitle: TextStyle;
  platformButtons: ViewStyle;
  platformRow: ViewStyle;
  successMessage: TextStyle;
  errorMessage: TextStyle;
  buttonContainer: ViewStyle;
}

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
  userName?: string;
  showUserName?: boolean;
}

/**
 * Modal for sharing achievements to social platforms
 */
export function ShareModal({
  isVisible,
  onClose,
  achievementData,
  userName,
  showUserName = false
}: ShareModalProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const cardRef = useRef<ViewShot>(null);
  
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Format achievement data for the ShareableCard component
  const cardProps: ShareableCardProps = {
    achievementTitle: achievementData.title,
    achievementDate: achievementData.date,
    achievementIcon: achievementData.icon,
    userName,
    showUserName,
    theme: isDarkMode ? 'dark' : 'light',
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
        showUserName ? userName : undefined
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
      <View style={[
        styles.modalContainer,
        isDarkMode && { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
      ]}>
        <View style={[
          styles.modalContent,
          { maxWidth: width * 0.9 },
          isDarkMode && { backgroundColor: '#333' }
        ]}>
          <View style={styles.header}>
            <Text style={[
              styles.title,
              isDarkMode && { color: '#FFF' }
            ]}>
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
                color={isDarkMode ? '#CCC' : '#666'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardContainer}>
            <ShareableCard {...cardProps} />
          </View>

          <View style={styles.sharingOptions}>
            <Text style={[
              styles.sharingOptionsTitle,
              isDarkMode && { color: '#CCC' }
            ]}>
              Share to:
            </Text>

            {isSharing ? (
              <ActivityIndicator size="large" color="#2E7D32" />
            ) : (
              <View style={styles.platformButtons}>
                <View style={styles.platformRow}>
                  <View style={styles.buttonContainer}>
                    <ShareButton
                      label="Instagram"
                      platformIcon="instagram"
                      onPress={() => handleShare('instagram')}
                      disabled={isSharing}
                    />
                  </View>
                  <View style={styles.buttonContainer}>
                    <ShareButton
                      label="Twitter"
                      platformIcon="twitter"
                      onPress={() => handleShare('twitter')}
                      disabled={isSharing}
                    />
                  </View>
                </View>
                <View style={styles.platformRow}>
                  <View style={styles.buttonContainer}>
                    <ShareButton
                      label="LinkedIn"
                      platformIcon="linkedin"
                      onPress={() => handleShare('linkedin')}
                      disabled={isSharing}
                    />
                  </View>
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
    </Modal>
  );
}

const styles = StyleSheet.create<Styles>({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    maxWidth: 350,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sharingOptions: {
    marginTop: 16,
    alignItems: 'center',
  },
  sharingOptionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 12,
  },
  platformButtons: {
    width: '100%',
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  successMessage: {
    marginTop: 16,
    color: '#2E7D32',
    fontWeight: '500',
  },
  errorMessage: {
    marginTop: 16,
    color: '#D32F2F',
    fontWeight: '500',
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 4,
  }
});

export default ShareModal;
