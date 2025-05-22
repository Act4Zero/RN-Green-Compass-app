import { Share, Platform, Linking } from 'react-native';
import Constants from 'expo-constants';

/**
 * Interface for shareable content data
 */
export interface ShareableContent {
  title: string;
  message: string;
  url?: string;
  imageUrl?: string;
  siteName?: string;
  imageWidth?: number;
  imageHeight?: number;
  appId?: string;
  type?: 'website' | 'article' | 'profile' | 'book' | 'video' | 'music' | 'place' | 'product';
}

/**
 * Interface for sharing result
 */
export interface ShareResult {
  success: boolean;
  error?: string;
  platformSpecific?: any;
}

/**
 * Social media platforms supported for sharing
 */
export type SocialPlatform = 'twitter' | 'linkedin' | 'general';

/**
 * Share content using device's native share dialog
 * 
 * @param content The content to share
 * @returns Promise with the result of the share operation
 */
export const nativeShareContent = async (content: ShareableContent): Promise<ShareResult> => {
  try {
    const shareOptions = {
      title: content.title,
      message: content.message,
      url: content.url,
    };

    const result = await Share.share(shareOptions);
    
    return {
      success: result.action !== Share.dismissedAction,
      platformSpecific: result,
    };
  } catch (error) {
    console.error('Error sharing content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Share content via web browser share URLs
 * 
 * @param content The content to share
 * @param platform Target social platform
 * @returns Promise with the result of the share operation
 */
/**
 * Generate meta tags for rich link previews
 */
const generateMetaTags = (content: ShareableContent): string => {
  const tags = [
    { property: 'og:title', content: content.title },
    { property: 'og:description', content: content.message },
    { property: 'og:url', content: content.url || 'https://greencompass.app' },
    { property: 'og:type', content: content.type || 'website' },
    { property: 'og:site_name', content: content.siteName || 'Green Compass' },
    { property: 'og:image', content: content.imageUrl || 'https://greencompass.app/images/og-default.jpg' },
    { property: 'og:image:width', content: String(content.imageWidth || 1200) },
    { property: 'og:image:height', content: String(content.imageHeight || 630) },

    // LinkedIn specific
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: content.title },
    { name: 'twitter:description', content: content.message },
    { name: 'twitter:image', content: content.imageUrl || 'https://greencompass.app/images/og-default.jpg' },
  ];

  return tags
    .filter(tag => tag.content) // Only include tags with content
    .map(tag => {
      if ('property' in tag) {
        return `<meta property="${tag.property}" content="${tag.content.replace(/"/g, '&quot;')}" />`;
      } else {
        return `<meta name="${tag.name}" content="${tag.content.replace(/"/g, '&quot;')}" />`;
      }
    })
    .join('\n');};

/**
 * Get the base URL for sharing
 */
const getShareUrl = (content: ShareableContent): string => {
  return content.url || 'https://greencompass.app';
};

/**
 * Share content via web browser share URLs with rich previews
 */
export const webShareContent = async (
  content: ShareableContent,
  platform: SocialPlatform
): Promise<ShareResult> => {
  try {
    const shareUrl = content.url || 'https://greencompass.app';
    const encodedMessage = encodeURIComponent(content.message);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(content.title);
    let shareLink = '';

    switch (platform) {
      case 'twitter':
        // Twitter Web Intent API with better formatting
        // Format the message to ensure it looks good in the Twitter intent window
        const twitterText = content.message.replace(/\n/g, ' ').trim();
        // Add hashtags for better visibility
        const twitterHashtags = encodeURIComponent('greencompass,sustainability');
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodedUrl}&hashtags=${twitterHashtags}`;
        break;

      case 'linkedin': {
        // Prepare the URL and message for LinkedIn sharing
        const shareUrl = getShareUrl(content);
        const linkedinText = content.message.replace(/\n/g, ' ').trim();
        
        // Construct the LinkedIn share URL with both URL and text
        const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(linkedinText)}`;
        
        // On mobile, prefer the Web Share API for better UX
        if (Platform.OS !== 'web' && typeof navigator !== 'undefined' && navigator.share) {
          try {
            const linkedinMessage = `${linkedinText}\n\n${shareUrl}`;
            
            await navigator.share({
              title: content.title,
              text: linkedinMessage,
              url: shareUrl
            });
            return { success: true };
          } catch (shareError) {
            console.log('Web Share API failed for LinkedIn, falling back to share URL');
            // Fall through to use the share URL if Web Share API fails
          }
        }
        
        // Use the LinkedIn share URL as fallback
        shareLink = linkedInShareUrl;
        break;
      }
        

      case 'general':
        // Try using Web Share API if available
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: content.title,
            text: content.message,
            url: shareUrl
          });
          return { success: true };
        } else {
          // Fallback to opening a mailto link as a universal sharing option
          const subject = encodeURIComponent(content.title);
          shareLink = `mailto:?subject=${subject}&body=${encodedMessage}%0A%0A${encodedUrl}`;
        }
        break;
    }
    
    // Note: For Facebook sharing in production, you should replace the app_id with your own Facebook App ID
    // The current app_id is a placeholder and should be updated for production use

    // Open the share URL in a new window/tab
    if (shareLink) {
      if (Platform.OS === 'web') {
        window.open(shareLink, '_blank', 'noopener,noreferrer');
      } else {
        await Linking.openURL(shareLink);
      }
      return { success: true };
    }
    
    return { 
      success: false,
      error: 'No share method available' 
    };
  } catch (error) {
    console.error('Error with web sharing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Share content to a specific platform, using the appropriate method based on platform
 * 
 * @param content The content to share
 * @param platform Target social platform
 * @returns Promise with the result of the share operation
 */
export const shareContent = async (
  content: ShareableContent,
  platform: SocialPlatform = 'general'
): Promise<ShareResult> => {
  // For mobile platforms, use the native share dialog
  if (platform === 'general' && Platform.OS !== 'web') {
    return nativeShareContent(content);
  }
  
  // For web or specific platforms, use web sharing
  return webShareContent(content, platform);
};

/**
 * Share achievement to a specific social platform
 * Uses platform-specific sharing mechanisms
 * 
 * @param content The content to share
 * @param platform Target social platform
 * @returns Promise with the result of the share operation
 */
export const shareToSocialPlatform = async (
  content: ShareableContent,
  platform: SocialPlatform = 'general'
): Promise<ShareResult> => {
  // Platform-specific message customization
  let message = content.message;
  let url = content.url || 'https://greencompass.app';
  
  switch (platform) {
    case 'twitter':
      // Twitter has character limits
      message = content.message.length > 240 
        ? `${content.message.substring(0, 237)}...` 
        : content.message;
      break;
    case 'linkedin':
      // LinkedIn custom formatting
      message = `${content.message}

#sustainability #greencompass`;
      break;
  }

  return shareContent({
    ...content,
    message,
    url,
  }, platform);
};

/**
 * Format achievement data for sharing
 * 
 * @param achievementTitle Title of the achievement
 * @param userName Optional user name to include
 * @param imageUrl Optional custom image URL
 * @param platform Optional platform to format for (defaults to generic)
 * @returns Formatted share content
 */
export const formatAchievementForSharing = (
  achievementTitle: string,
  userName?: string,
  imageUrl?: string,
  platform?: 'linkedin' | 'twitter' | 'general'
): ShareableContent => {
  const baseUrl = 'https://greencompass.app';
  const achievementSlug = achievementTitle.toLowerCase().replace(/\s+/g, '-');
  const url = `${baseUrl}/achievements/${encodeURIComponent(achievementSlug)}`;
  
  // Platform-specific formatting
  const formats = {
    linkedin: {
      title: `Achievement Unlocked: ${achievementTitle} | Green Compass`,
      message: `${userName ? `${userName} has` : 'I have'} earned the "${achievementTitle}" achievement in Green Compass!`,
    },
    twitter: {
      title: `Achievement: ${achievementTitle} | Green Compass`,
      message: `${userName ? `${userName} just` : 'Just'} earned the "${achievementTitle}" achievement!`,
    },
    general: {
      title: `Achievement: ${achievementTitle} | Green Compass`,
      message: `${userName ? `${userName} just` : 'I just'} earned the "${achievementTitle}" achievement in Green Compass!`,
    }
  };

  const format = formats[platform || 'general'] || formats.general;
  
  return {
    title: format.title,
    message: format.message,
    url,
    imageUrl: imageUrl || `${baseUrl}/images/achievements/og-${achievementSlug}.jpg`,
    siteName: 'Green Compass',
    type: 'article',
    imageWidth: 1200,
    imageHeight: 630,
    appId: undefined
  };
};

/**
 * Check if any sharing method is available on the device
 * 
 * @param platform Optional specific platform to check
 * @returns Boolean indicating if sharing is available
 */
export const isSharingAvailable = (platform?: SocialPlatform): boolean => {
  // For general sharing, check if native sharing is available
  if (!platform || platform === 'general') {
    return Platform.OS !== 'web' || (typeof navigator !== 'undefined' && !!navigator.share);
  }
  
  // For web, all platform-specific sharing via URLs is available
  return true;
};

/**
 * Get available social platforms for the current environment
 * 
 * @returns Array of available social platforms
 */
export const getAvailableSocialPlatforms = (): SocialPlatform[] => {
  const platforms: SocialPlatform[] = [];
  
  // Always include general sharing
  platforms.push('general');
  
  // Include platform-specific sharing based on availability
  if (Platform.OS === 'web' || Platform.OS === 'ios' || Platform.OS === 'android') {
    platforms.push('twitter');
    platforms.push('linkedin');
  }
  
  return platforms;
};
