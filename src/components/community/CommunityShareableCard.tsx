import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, TextStyle, ImageStyle, useColorScheme } from 'react-native';
import { format } from 'date-fns';
import ViewShot, { ViewShotProperties } from 'react-native-view-shot';

interface CommunityShareableCardProps {
  postTitle?: string | null;
  postContent: string;
  authorName: string;
  postDate: Date;
  theme?: 'light' | 'dark';
  viewShotRef?: React.RefObject<ViewShot>;
  viewShotOptions?: ViewShotProperties;
}

/**
 * ShareableCard component for rendering community posts in a shareable format
 */
export function CommunityShareableCard({
  postTitle,
  postContent,
  authorName,
  postDate,
  theme: forcedTheme,
  viewShotRef,
  viewShotOptions = {}
}: CommunityShareableCardProps) {
  const deviceTheme = useColorScheme();
  const theme: 'light' | 'dark' = forcedTheme || deviceTheme || 'light';
  const defaultRef = useRef<ViewShot>(null);
  const ref = viewShotRef || defaultRef;
  
  const formattedDate = postDate instanceof Date 
    ? format(postDate, 'PPP') 
    : 'Date not available';

  // Truncate content if too long
  const maxContentLength = 280;
  const displayContent = postContent.length > maxContentLength
    ? `${postContent.substring(0, maxContentLength).trim()}...`
    : postContent;

  return (
    <ViewShot 
      ref={ref} 
      options={{
        format: 'jpg',
        quality: 0.9,
        result: 'data-uri',
        ...viewShotOptions
      }}
      style={[
        styles.container,
        theme === 'dark' ? { backgroundColor: '#1E1E1E' } : null
      ]}
    >
      <View style={styles.cardContent}>
        {/* Post Header with title */}
        {postTitle && (
          <Text style={[
            styles.title,
            theme === 'dark' ? { color: '#FFFFFF' } : null
          ]}>
            {postTitle}
          </Text>
        )}
        
        {/* Post content as a quote */}
        <View style={styles.quoteContainer}>
          <View style={styles.quoteBar} />
          <Text style={[
            styles.quoteText,
            theme === 'dark' ? { color: '#E0E0E0' } : null
          ]}>
            "{displayContent}"
          </Text>
        </View>
        
        {/* Author and date */}
        <View style={styles.attributionContainer}>
          <Text style={[
            styles.authorText,
            theme === 'dark' ? { color: '#FFFFFF' } : null
          ]}>
            — {authorName}
          </Text>
          <Text style={[
            styles.dateText,
            theme === 'dark' ? { color: '#B0B0B0' } : null
          ]}>
            {formattedDate}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Image 
          source={require('../../../assets/images/GCLogo-no-bg.png')} 
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
    </ViewShot>
  );
}

/**
 * Captures the CommunityShareableCard as an image
 * 
 * @param ref ViewShot ref to capture
 * @returns Promise with the image URI
 */
export const captureCommunityShareableCard = async (ref: React.RefObject<ViewShot>): Promise<string | null> => {
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

// Define styles
const styles = StyleSheet.create({
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  quoteContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  quoteBar: {
    width: 4,
    backgroundColor: '#2E7D32',
    marginRight: 8,
    borderRadius: 2,
  },
  quoteText: {
    flex: 1,
    fontSize: 16,
    color: '#444444',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  attributionContainer: {
    marginTop: 8,
    marginLeft: 12,
  },
  authorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
    marginTop: 4,
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

export default CommunityShareableCard;
