import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TextStyle, ImageStyle, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BadgeShareModal from './BadgeShareModal';
import { formatBadgeForSharing } from '@/utils/badgeShareUtils';

interface BadgeItemProps {
  name: string;
  description: string;
  imageUrl?: string;
  isEarned: boolean;
  category: string;
  earnedDate?: string;
  userName?: string;
}

function BadgeItem({ name, description, imageUrl, isEarned, category, earnedDate, userName }: BadgeItemProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const showImage = imageUrl && !hasImageError;
  
  // Only allow sharing of earned badges
  const canShare = isEarned;
  
  // Format badge data for sharing
  const shareContent = formatBadgeForSharing(
    name,
    description,
    category,
    earnedDate,
    userName
  );
  
  // Handle share button press
  const handleSharePress = useCallback((e: GestureResponderEvent) => {
    e.stopPropagation();
    setIsShareModalVisible(true);
  }, []);
  
  // Handle closing the share modal
  const handleCloseShareModal = useCallback(() => {
    setIsShareModalVisible(false);
  }, []);
  
  // Handle share error
  const handleShareError = useCallback((error: string) => {
    console.error('Error sharing badge:', error);
  }, []);

  return (
    <>
      <View style={[styles.badgeContainer, !isEarned && styles.badgeUnearnedContainer]}>
      <View style={styles.badgeIconContainer}>
        {showImage ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.badgeIcon, !isEarned && styles.badgeUnearnedIcon as ImageStyle]}
            resizeMode="contain"
            onError={() => setHasImageError(true)}
            accessibilityLabel={`${name} badge`}
          />
        ) : (
          <View style={styles.placeholderIcon}>
            <Ionicons name="trophy" size={32} color={isEarned ? "#2E7D32" : "#AAAAAA"} accessibilityLabel="Badge placeholder" />
          </View>
        )}
        {isEarned && (
          <View style={styles.earnedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
          </View>
        )}
      </View>
      <View style={styles.badgeInfo}>
        <View style={styles.badgeHeader}>
          <Text style={[styles.badgeName, !isEarned && styles.badgeUnearnedText]}>{name}</Text>
          {canShare && (
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleSharePress}
              accessibilityLabel={`Share ${name} badge`}
            >
              <Ionicons name="share-social-outline" size={18} color="#2E7D32" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.badgeDescription, !isEarned && styles.badgeUnearnedText]}>
          {description}
        </Text>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
      </View>
    </View>
      
      {/* Share Modal */}
      {isEarned && (
        <BadgeShareModal
          isVisible={isShareModalVisible}
          onClose={handleCloseShareModal}
          onError={handleShareError}
          badgeData={{
            name,
            description,
            category,
            isEarned,
            earnedDate,
            imageUrl
          }}
          shareContent={shareContent}
          userName={userName}
        />
      )}
    </>
  );
}

interface Styles {
  badgeContainer: ViewStyle;
  badgeUnearnedContainer: ViewStyle;
  badgeIconContainer: ViewStyle;
  badgeIcon: ImageStyle;
  badgeUnearnedIcon: ImageStyle;
  placeholderIcon: ViewStyle;
  earnedBadge: ViewStyle;
  badgeInfo: ViewStyle;
  badgeHeader: ViewStyle;
  badgeName: TextStyle;
  badgeUnearnedText: TextStyle;
  badgeDescription: TextStyle;
  categoryChip: ViewStyle;
  categoryText: TextStyle;
  shareButton: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  badgeContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
  },
  badgeUnearnedContainer: {
    backgroundColor: '#F9F9F9',
  },
  badgeIconContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    width: 50,
    height: 50,
  },
  badgeUnearnedIcon: {
    opacity: 0.5,
  },
  placeholderIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  badgeInfo: {
    flex: 1,
    marginLeft: 10,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  badgeUnearnedText: {
    color: '#888888',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 6,
  },
  categoryChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.3)',
  },
  categoryText: {
    fontSize: 10,
    color: '#2E7D32',
  },
  shareButton: {
    padding: 4,
    backgroundColor: '#EAF6EA',
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BadgeItem;
