import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import ViewShot, { ViewShotProperties } from 'react-native-view-shot';
import { useAppLocale } from '@/context/AppLocaleContext';

interface Styles {
  container: ViewStyle;
  cardContent: ViewStyle;
  header: ViewStyle;
  achievementIcon: ImageStyle;
  achievementInfo: ViewStyle;
  title: TextStyle;
  dateText: TextStyle;
  userName: TextStyle;
  footer: ViewStyle;
  logo: ImageStyle;
  appName: TextStyle;
}

export interface ShareableCardProps {
  achievementTitle: string;
  achievementDate: Date;
  achievementIcon?: string;
  userName?: string;
  showUserName?: boolean;
  theme?: 'light' | 'dark';
  viewShotRef?: React.RefObject<ViewShot>;
  viewShotOptions?: ViewShotProperties;
  accentColor?: string;
}

/**
 * ShareableCard component for rendering achievements in a shareable format
 */
export function ShareableCard({
  achievementTitle,
  achievementDate,
  achievementIcon,
  userName,
  showUserName = false,
  theme: forcedTheme,
  viewShotRef,
  viewShotOptions = {}
}: ShareableCardProps) {
  const { locale, t } = useAppLocale();
  // Always use light theme
  const theme: 'light' | 'dark' = 'light';
  const defaultRef = useRef<ViewShot>(null);
  const ref = viewShotRef || defaultRef;
  
  const formattedDate = achievementDate instanceof Date 
    ? achievementDate.toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : t('Date not available', 'Няма налична дата');

  return (
    <ViewShot ref={ref}>
      <View style={styles.container}>
        <View style={styles.cardContent}>
          <View style={styles.header}>
            {achievementIcon ? (
              <Image 
                source={{ uri: achievementIcon }} 
                style={iconStyles.achievementIcon as ImageStyle} 
              />
            ) : (
              <View style={[
                styles.achievementIcon, 
                { backgroundColor: '#2E7D32' }
              ]}>
                <Text style={{ color: 'white', fontSize: 24 }}>🏆</Text>
              </View>
            )}
            
            <View style={styles.achievementInfo}>
              <Text style={styles.title}>
                {achievementTitle}
              </Text>
              <Text style={styles.dateText}>
                {t('Achieved on', 'Постигнато на')} {formattedDate}
              </Text>
              
              {showUserName && userName && (
                <Text style={styles.userName}>
                  {t('by', 'от')} {userName}
                </Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Image 
            source={require('../../../assets/images/GCLogo-rich-premium-original-shape.png')}
            style={iconStyles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.appName}>
            Green Compass
          </Text>
        </View>
      </View>
    </ViewShot>
  );
}

/**
 * Captures the ShareableCard as an image
 * 
 * @param ref ViewShot ref to capture
 * @returns Promise with the image URI
 */
export const captureShareableCard = async (ref: React.RefObject<ViewShot>): Promise<string | null> => {
  if (!ref.current) {
    console.error('ViewShot ref is not available');
    return null;
  }
  
  try {
    // Use viewshot's capture method with type checking
    if (typeof ref.current.capture === 'function') {
      const uri = await ref.current.capture();
      return uri;
    }
    console.error('ViewShot capture method not available');
    return null;
  } catch (error) {
    console.error('Error capturing card:', error);
    return null;
  }
};

// Define separate style types for different style categories
interface ContainerStyles {
  container: ViewStyle;
  cardContent: ViewStyle;
  header: ViewStyle;
  achievementInfo: ViewStyle;
  footer: ViewStyle;
}

interface IconStyles {
  achievementIcon: ViewStyle;
  logo: ImageStyle;
}

interface TextStyles {
  title: TextStyle;
  dateText: TextStyle;
  userName: TextStyle;
  appName: TextStyle;
}

// Create separate style objects for each category
const containerStyles = StyleSheet.create<ContainerStyles>({
  container: {
    width: 300,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
});

const iconStyles = StyleSheet.create<IconStyles>({
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 8,
  }
});

const textStyles = StyleSheet.create<TextStyles>({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444444',
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2E7D32',
  }
});

// Combine all styles for convenience
const styles = {
  ...containerStyles,
  ...iconStyles,
  ...textStyles
};

export default ShareableCard;
