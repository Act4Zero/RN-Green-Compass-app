import React, { useRef, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
// We'll use Share API directly instead of expo-sharing
// import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import BadgeShareableCard from './BadgeShareableCard';
import useUserDisplayName from '@/hooks/useUserDisplayName';

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
  const viewShotRef = useRef<ViewShot>(null);
  const { displayName } = useUserDisplayName();

  const handleClose = () => {
    onClose();
  };

  const handleShareAsText = async () => {
    try {
      const result = await Share.share({
        title: shareContent.title,
        message: shareContent.message,
        url: shareContent.url,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared via ${result.activityType}`);
        } else {
          console.log('Shared');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : String(error));
      }
      console.error('Error sharing:', error);
    }
  };

  const handleShareAsImage = async () => {
    try {
      if (viewShotRef.current) {
        // Capture the view as an image
        const uri = await viewShotRef.current?.capture?.() || '';
        
        if (!uri) {
          throw new Error('Failed to capture image');
        }
        
        if (Platform.OS === 'web') {
          // On web, we can only share as a text with a URL
          handleShareAsText();
          return;
        }
        
        // Use Share API instead of expo-sharing
        const fileUri = `${FileSystem.cacheDirectory}badge-share.png`;
        await FileSystem.copyAsync({ from: uri, to: fileUri });
        await Share.share({
          title: shareContent.title,
          url: fileUri,
        });
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : String(error));
      }
      console.error('Error sharing image:', error);
      
      // If image sharing fails, fallback to text sharing
      Alert.alert(
        'Could not share as image',
        'Sharing as text instead',
        [{ text: 'OK', onPress: handleShareAsText }]
      );
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
            <Text style={styles.modalTitle}>Share Badge</Text>
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
            <Text style={styles.shareOptionsTitle}>Share as:</Text>
            
            <View style={styles.shareButtonsContainer}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareAsText}
              >
                <Ionicons name="text" size={24} color="#2E7D32" />
                <Text style={styles.shareButtonText}>Text</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareAsImage}
              >
                <Ionicons name="image" size={24} color="#2E7D32" />
                <Text style={styles.shareButtonText}>Image</Text>
              </TouchableOpacity>
            </View>
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
  shareButton: ViewStyle;
  shareButtonText: TextStyle;
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
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shareButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    width: 80,
  },
  shareButtonText: {
    marginTop: 8,
    color: '#444',
    fontWeight: '500',
  },
});

export default BadgeShareModal;
