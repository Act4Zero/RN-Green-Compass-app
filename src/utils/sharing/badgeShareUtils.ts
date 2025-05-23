/**
 * Utility functions for formatting badge data for sharing
 */

interface BadgeShareContent {
  title: string;
  message: string;
  url?: string;
  imageUrl?: string;
}

/**
 * Formats badge data for sharing an individual badge
 * 
 * @param badgeName Name of the badge
 * @param badgeDescription Description of achievement
 * @param badgeCategory Badge category (e.g., "Recycle", "Energy")
 * @param earnedDate When the badge was earned (if available)
 * @param userName User's name for personalization
 * @returns Formatted sharing content
 */
export function formatBadgeForSharing(
  badgeName: string,
  badgeDescription: string,
  badgeCategory: string,
  earnedDate?: string | Date,
  userName?: string
): BadgeShareContent {
  // Format date if provided
  let dateString = '';
  if (earnedDate) {
    try {
      const date = typeof earnedDate === 'string' ? new Date(earnedDate) : earnedDate;
      if (!isNaN(date.getTime())) {
        dateString = ` on ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
      }
    } catch (e) {
      // If parsing fails, don't add a date
    }
  }
  
  // Create a title for sharing
  const title = `${badgeName} Badge Earned!`;
  
  // Create personalized message
  let message = '';
  if (userName) {
    message += `${userName} earned the ${badgeName} badge${dateString}! `;
  } else {
    message += `I earned the ${badgeName} badge${dateString}! `;
  }
  
  // Add description and category
  message += `\n\n"${badgeDescription}" `;
  message += `\n\nCategory: ${badgeCategory}`;
  
  // Add call to action
  message += `\n\nJoin me on Green Compass and earn your own sustainability badges! Every small action makes a difference.`;
  
  // Add hashtags
  message += `\n\n#GreenCompass #${badgeCategory.replace(/\s/g, '')} #SustainabilityBadge`;
  
  return {
    title,
    message,
    url: 'https://greencompass.eco/badges' // Placeholder URL
  };
}

/**
 * Formats data for sharing a summary of earned badges
 * 
 * @param earnedBadgeCount Total number of badges earned
 * @param totalBadgeCount Total number of available badges
 * @param recentBadgeNames Names of recently earned badges (up to 3)
 * @param userName User's name for personalization
 * @returns Formatted sharing content
 */
export function formatBadgeSummaryForSharing(
  earnedBadgeCount: number,
  totalBadgeCount: number,
  recentBadgeNames: string[] = [],
  userName?: string
): BadgeShareContent {
  // Create a title for sharing
  const title = earnedBadgeCount === 1 
    ? "1 Sustainability Badge Earned!" 
    : `${earnedBadgeCount} Sustainability Badges Earned!`;
  
  // Create personalized message
  let message = '';
  if (userName) {
    message += `${userName} has earned ${earnedBadgeCount} out of ${totalBadgeCount} sustainability badges on Green Compass! `;
  } else {
    message += `I've earned ${earnedBadgeCount} out of ${totalBadgeCount} sustainability badges on Green Compass! `;
  }
  
  // Add recent badge names if available
  if (recentBadgeNames.length > 0) {
    const recentBadges = recentBadgeNames.slice(0, 3);
    if (recentBadges.length === 1) {
      message += `\n\nMost recently earned: ${recentBadges[0]}`;
    } else {
      message += `\n\nRecently earned badges include: ${recentBadges.join(', ')}`;
    }
  }
  
  // Add progress percentage
  const progressPercentage = Math.round((earnedBadgeCount / totalBadgeCount) * 100);
  message += `\n\nThat's ${progressPercentage}% of the way to collecting them all!`;
  
  // Add call to action
  message += `\n\nJoin me on Green Compass and start your own sustainability journey. Every badge represents a step toward a greener future.`;
  
  // Add hashtags
  message += `\n\n#GreenCompass #SustainabilityJourney #GreenAchievements`;
  
  return {
    title,
    message,
    url: 'https://greencompass.eco/badges' // Placeholder URL
  };
}

export default {
  formatBadgeForSharing,
  formatBadgeSummaryForSharing
};
