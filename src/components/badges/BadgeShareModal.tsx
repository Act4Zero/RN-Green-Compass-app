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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import BadgeShareableCard from './BadgeShareableCard';
import useUserDisplayName from '@/hooks/useUserDisplayName';
import ShareButton from '../sharing/ShareButton';
import { shareToSocialPlatform, SocialPlatform } from '../../utils/sharing/shareUtils';
import { useAppLocale } from '@/context/AppLocaleContext';

interface BadgeShareModalProps {
  isVisible: boolean;
  onClose: () => void;
  onError?: (error: string) => void;
  badgeData: {
    name: string;
    description: string;
    category: string;
    isEarned: boolean;
    earnedDate?: string;
    imageUrl?: string;
  };
  shareContent: {
    title: string;
    message: string;
    url?: string;
    imageUrl?: string;
  };
  userName?: string;
}

function BadgeShareModal({
  isVisible,
  onClose,
  onError,
  badgeData,
  shareContent,
}: BadgeShareModalProps) {
  const { t } = useAppLocale();
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
    const fileUri = `${FileSystem.cacheDirectory}badge-share.png`;
    await FileSystem.copyAsync({ from: uri, to: fileUri });
    return fileUri;
  };

  // Handle sharing to a specific platform
  const handleShare = async (platform: SocialPlatform) => {
    try {
      setIsSharing(true);
      setShareResult({});

      // Create share content with the display name
      const userName = displayName || 'I';
      
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
        message: `${userName} earned the ${badgeData.name} badge on Green Compass! Join the movement for sustainable living.`
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
      if (onError) {
        onError(error instanceof Error ? error.message : String(error));
      }
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

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
            <Text style={styles.modalTitle}>{t('Share Badge', 'Споделяне на значка')}</Text>
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
              <BadgeShareableCard
                badgeName={badgeData.name}
                badgeDescription={badgeData.description}
                badgeCategory={badgeData.category}
                earnedDate={badgeData.earnedDate}
                isEarned={badgeData.isEarned}
                imageUrl={badgeData.imageUrl}
                userName={displayName}
              />
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

interface Styles {
  modalOverlay: ViewStyle;
  modalContainer: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  closeButton: ViewStyle;
  sharePreviewContainer: ViewStyle;
  viewShot: ViewStyle;
  shareOptionsContainer: ViewStyle;
  shareOptionsTitle: TextStyle;
  shareButtonsContainer: ViewStyle;
  platformRow: ViewStyle;
  buttonContainer: ViewStyle;
  successMessage: TextStyle;
  errorMessage: TextStyle;
}

const styles = StyleSheet.create<Styles>({
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

export default BadgeShareModal;
