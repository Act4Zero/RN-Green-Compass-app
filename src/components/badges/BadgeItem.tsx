import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BadgeItemProps {
  name: string;
  description: string;
  imageUrl?: string;
  isEarned: boolean;
  category: string;
}

function BadgeItem({ name, description, imageUrl, isEarned, category }: BadgeItemProps) {
  return (
    <View style={[styles.badgeContainer, !isEarned && styles.badgeUnearnedContainer]}>
      <View style={styles.badgeIconContainer}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={[styles.badgeIcon, !isEarned && styles.badgeUnearnedIcon as ImageStyle]} 
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderIcon}>
            <Ionicons name="trophy" size={32} color={isEarned ? "#2E7D32" : "#AAAAAA"} />
          </View>
        )}
        {isEarned && (
          <View style={styles.earnedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
          </View>
        )}
      </View>
      <View style={styles.badgeInfo}>
        <Text style={[styles.badgeName, !isEarned && styles.badgeUnearnedText]}>{name}</Text>
        <Text style={[styles.badgeDescription, !isEarned && styles.badgeUnearnedText]}>
          {description}
        </Text>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
      </View>
    </View>
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
  badgeName: TextStyle;
  badgeUnearnedText: TextStyle;
  badgeDescription: TextStyle;
  categoryChip: ViewStyle;
  categoryText: TextStyle;
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
    marginLeft: 12,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
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
});

export default BadgeItem;
