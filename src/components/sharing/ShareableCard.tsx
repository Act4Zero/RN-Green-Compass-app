import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, TextStyle, ImageStyle, useColorScheme } from 'react-native';
import { format } from 'date-fns';
import ViewShot, { ViewShotProperties } from 'react-native-view-shot';

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
  viewShotOptions = { quality: 1, format: 'png' }
}: ShareableCardProps) {
  const deviceTheme = useColorScheme();
  const theme = forcedTheme || deviceTheme || 'light';
  const defaultRef = useRef<ViewShot>(null);
  const ref = viewShotRef || defaultRef;
  
  const formattedDate = achievementDate instanceof Date 
    ? format(achievementDate, 'PPP') 
    : 'Date not available';

  return (
    <ViewShot ref={ref} {...viewShotOptions}>
      <View style={[
        styles.container, 
        theme === 'dark' ? { backgroundColor: '#2F2F2F' } : null
      ]}>
        <View style={styles.cardContent}>
          <View style={styles.header}>
            {achievementIcon ? (
              <Image 
                source={{ uri: achievementIcon }} 
                style={styles.achievementIcon} 
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
              <Text style={[
                styles.title, 
                theme === 'dark' ? { color: '#FFFFFF' } : null
              ]}>
                {achievementTitle}
              </Text>
              <Text style={[
                styles.dateText,
                theme === 'dark' ? { color: '#CCCCCC' } : null
              ]}>
                Achieved on {formattedDate}
              </Text>
              
              {showUserName && userName && (
                <Text style={[
                  styles.userName,
                  theme === 'dark' ? { color: '#FFFFFF' } : null
                ]}>
                  by {userName}
                </Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={[
            styles.appName,
            theme === 'dark' ? { color: '#FFFFFF' } : null
          ]}>
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
    const uri = await ref.current.capture();
    return uri;
  } catch (error) {
    console.error('Error capturing card:', error);
    return null;
  }
};

const styles = StyleSheet.create<Styles>({
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
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2E7D32',
  }
});

export default ShareableCard;
