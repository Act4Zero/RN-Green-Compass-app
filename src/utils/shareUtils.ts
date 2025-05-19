import { Share, Platform } from 'react-native';

/**
 * Interface for shareable content data
 */
export interface ShareableContent {
  title: string;
  message: string;
  url?: string;
  imageUrl?: string;
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
export type SocialPlatform = 'instagram' | 'twitter' | 'linkedin' | 'general';

/**
 * Share content to device's native share dialog
 * 
 * @param content The content to share
 * @returns Promise with the result of the share operation
 */
export const shareContent = async (content: ShareableContent): Promise<ShareResult> => {
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
 * Share achievement to a specific social platform
 * Currently uses the device's native share dialog but could be extended
 * for platform-specific implementations
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
  let url = content.url;
  
  switch (platform) {
    case 'twitter':
      // Twitter has character limits
      message = content.message.length > 240 
        ? `${content.message.substring(0, 237)}...` 
        : content.message;
      break;
    case 'instagram':
      // Instagram primarily shares images, so we'd ideally focus on image sharing
      // This would require deeper integration using Expo's sharing API or
      // a dedicated Instagram sharing module
      break;
    case 'linkedin':
      // LinkedIn custom formatting
      message = `${content.message}\n\n#sustainability #greencompass`;
      break;
  }

  return shareContent({
    ...content,
    message,
    url,
  });
};

/**
 * Format achievement data for sharing
 * 
 * @param achievementTitle Title of the achievement
 * @param userName Optional user name to include
 * @returns Formatted share content
 */
export const formatAchievementForSharing = (
  achievementTitle: string,
  userName?: string
): ShareableContent => {
  const userPrefix = userName ? `${userName} just` : 'I just';
  
  return {
    title: 'Green Compass Achievement',
    message: `${userPrefix} earned the "${achievementTitle}" achievement in Green Compass! Join me in making sustainable choices every day.`,
    url: 'https://greencompass.app', // Could be a dynamic deep link in the future
  };
};

/**
 * Check if native sharing is available on the device
 * 
 * @returns Boolean indicating if sharing is available
 */
export const isSharingAvailable = (): boolean => {
  return Platform.OS !== 'web' || (typeof navigator !== 'undefined' && !!navigator.share);
};
