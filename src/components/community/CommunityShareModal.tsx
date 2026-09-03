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
  useWindowDimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import CommunityShareableCard, { captureCommunityShareableCard } from './CommunityShareableCard';
import ShareButton from '../sharing/ShareButton';
import { shareToSocialPlatform, SocialPlatform } from '../../utils/sharing/shareUtils';
import useUserDisplayName from '@/hooks/useUserDisplayName';
import { useAppLocale } from '@/context/AppLocaleContext';

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

export interface CommunityShareModalProps {
  isVisible: boolean;
  onClose: () => void;
  postData: {
    title?: string | null;
    content: string;
    authorName: string;
    date: Date;
    shareContent: {
      title: string;
      message: string;
      url?: string;
      imageUrl?: string;
    };
  };
}

/**
 * Modal for sharing community posts to social platforms
 */
export function CommunityShareModal({
  isVisible,
  onClose,
  postData
}: CommunityShareModalProps) {
  const { t } = useAppLocale();
  const { width } = useWindowDimensions();
  const cardRef = useRef<ViewShot>(null);
  const { displayName } = useUserDisplayName();
  
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  /**
   * Handle sharing to a specific platform
   * 
   * @param platform The social platform to share to
   */
  const handleShare = async (platform: SocialPlatform) => {
    try {
      setIsSharing(true);
      setShareResult({});

      const shareContent = postData.shareContent;

      // If we're on a mobile platform and need an image, capture the card
      if (Platform.OS !== 'web' && ['instagram'].includes(platform)) {
        const imageUri = await captureCommunityShareableCard(cardRef);
        if (imageUri) {
          shareContent.imageUrl = imageUri;
        }
      }

      // Share to the selected platform
      const result = await shareToSocialPlatform(shareContent, platform);

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
          message: result.error || t('Failed to share. Please try again.', 'Споделянето е неуспешно. Опитайте отново.')
        });
      }
    } catch {
      setShareResult({
        success: false,
        message: t('Unknown error occurred', 'Възникна неизвестна грешка')
      });
      Alert.alert(t('Sharing Error', 'Грешка при споделяне'), t('Failed to share this post. Please try again later.', 'Публикацията не можа да бъде споделена. Опитайте отново по-късно.'));
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
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('Share This Post', 'Споделяне на публикацията')}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.cardContainer}>
            <CommunityShareableCard
              postTitle={postData.title}
              postContent={postData.content}
              authorName={postData.authorName}
              postDate={postData.date}
              theme="light"
              viewShotRef={cardRef}
            />
          </View>
          
          {/* Social sharing options */}
          <View style={styles.sharingOptions}>
            <Text style={styles.sharingOptionsTitle}>
              {t('Share to', 'Сподели чрез')}
            </Text>
            
            {isSharing ? (
              <ActivityIndicator size="large" color="#2E7D32" />
            ) : (
              <View style={styles.platformButtons}>
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
            
            {/* Share feedback messages */}
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

export default CommunityShareModal;
