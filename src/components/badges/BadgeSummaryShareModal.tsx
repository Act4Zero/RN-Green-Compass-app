import React, { useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';

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
  };
  userName?: string;
}

function BadgeSummaryShareModal({
  isVisible,
  onClose,
  onError,
  badgeData,
  shareContent,
  userName,
}: BadgeSummaryShareModalProps) {
  const viewShotRef = useRef<ViewShot>(null);

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
        
        // Use Share API
        const fileUri = `${FileSystem.cacheDirectory}badge-summary-share.png`;
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
            <Text style={styles.modalTitle}>Share Badge Achievements</Text>
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
                  <Text style={styles.shareCardTitle}>Badge Achievements</Text>
                  <View style={styles.logoContainer}>
                    <Ionicons name="leaf" size={24} color="#2E7D32" />
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      <Text style={styles.progressHighlight}>{badgeData.earnedBadgeCount}</Text>
                      {" of "}
                      <Text style={styles.totalBadges}>{badgeData.totalBadgeCount}</Text>
                      {" badges earned"}
                    </Text>
                    <Text style={styles.progressPercentage}>{completionPercentage}% Complete</Text>
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
                    <Text style={styles.recentBadgesTitle}>Recent Achievements:</Text>
                    {badgeData.recentBadgeNames.map((name, index) => (
                      <View key={index} style={styles.badgeItem}>
                        <Ionicons name="trophy" size={14} color="#2E7D32" style={{marginRight: 6}} />
                        <Text style={styles.badgeName}>{name}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={styles.shareCardFooter}>
                  {userName ? (
                    <Text style={styles.footerText}>{userName}'s sustainability journey</Text>
                  ) : (
                    <Text style={styles.footerText}>My sustainability journey</Text>
                  )}
                  <Text style={styles.appPromo}>via Green Compass App</Text>
                </View>
              </View>
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

export default BadgeSummaryShareModal;
