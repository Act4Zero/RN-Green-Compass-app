import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, ImageStyle, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppLocale } from '@/context/AppLocaleContext';

interface BadgeShareableCardProps {
  badgeName: string;
  badgeDescription: string;
  badgeCategory: string;
  earnedDate?: string;
  isEarned: boolean;
  imageUrl?: string;
  userName?: string;
}

function BadgeShareableCard({
  badgeName,
  badgeDescription,
  badgeCategory,
  earnedDate,
  isEarned,
  imageUrl,
  userName
}: BadgeShareableCardProps) {
  const { locale, t } = useAppLocale();
  // Format the earned date if available
  let formattedDate = '';
  if (earnedDate) {
    try {
      const date = new Date(earnedDate);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-US', {
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
    } catch (e) {
      // If parsing fails, leave the date empty
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{badgeName} {t('Badge', 'значка')}</Text>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={20} color="#2E7D32" />
        </View>
      </View>

      <View style={styles.badgeContent}>
        <View style={styles.badgeIconContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.badgeIcon}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderIcon}>
              <Ionicons name="trophy" size={60} color="#2E7D32" />
            </View>
          )}
          {isEarned && (
            <View style={styles.earnedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
            </View>
          )}
        </View>

        <View style={styles.badgeDetails}>
          <Text style={styles.description}>{badgeDescription}</Text>
          
          <View style={styles.badgeMetadata}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{badgeCategory}</Text>
            </View>
            
            {formattedDate && (
              <Text style={styles.earnedDate}>{t('Earned on', 'Спечелена на')} {formattedDate}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {userName ? (
          <Text style={styles.footerText}>{t(`${userName}'s sustainability journey`, `Устойчивият път на ${userName}`)}</Text>
        ) : (
          <Text style={styles.footerText}>{t('My sustainability journey', 'Моят път към устойчивостта')}</Text>
        )}
        <Text style={styles.appPromo}>{t('via Green Compass App', 'чрез Green Compass')}</Text>
      </View>
    </View>
  );
}

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  logoContainer: ViewStyle;
  badgeContent: ViewStyle;
  badgeIconContainer: ViewStyle;
  badgeIcon: ImageStyle;
  placeholderIcon: ViewStyle;
  earnedBadge: ViewStyle;
  badgeDetails: ViewStyle;
  description: TextStyle;
  badgeMetadata: ViewStyle;
  categoryChip: ViewStyle;
  categoryText: TextStyle;
  earnedDate: TextStyle;
  footer: ViewStyle;
  footerText: TextStyle;
  appPromo: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  logoContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#EAF6EA',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContent: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  badgeIconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  badgeIcon: {
    width: 80,
    height: 80,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  badgeDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  badgeMetadata: {
    flexDirection: 'column',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#EAF6EA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  earnedDate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  footer: {
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
});

export default BadgeShareableCard;
