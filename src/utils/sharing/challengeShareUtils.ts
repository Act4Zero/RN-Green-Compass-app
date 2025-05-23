/**
 * Utility functions for formatting challenge data for sharing
 */

interface ChallengeShareContent {
  title: string;
  message: string;
  url?: string;
  imageUrl?: string;
}

/**
 * Formats challenge data for sharing
 * 
 * @param challengeTitle Title of the challenge
 * @param challengeDescription Description of the challenge
 * @param startDate Start date of the challenge
 * @param endDate End date of the challenge
 * @param isParticipant Whether the user is participating in the challenge
 * @param participantCount Number of participants in the challenge
 * @param progressMetric User's progress percentage (if participating)
 * @param userName User's name (for personalization)
 * @returns Formatted sharing content
 */
export function formatChallengeForSharing(
  challengeTitle: string,
  challengeDescription: string,
  startDate: Date,
  endDate: Date,
  isParticipant: boolean,
  participantCount: number,
  progressMetric?: number,
  userName?: string
): ChallengeShareContent {
  // Format dates for display
  const startDateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDateStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dateRange = `${startDateStr} - ${endDateStr}`;
  
  // Current date for checking if challenge is active
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;
  const hasEnded = now > endDate;
  
  // Create title
  const title = `${challengeTitle} Challenge`;
  
  // Create personalized message
  let message = '';
  
  // Add personalized introduction based on participation and challenge status
  if (userName) {
    if (isParticipant && isActive) {
      message += `${userName} is participating in the "${challengeTitle}" challenge on Green Compass! `;
      if (progressMetric !== undefined) {
        message += `Currently at ${progressMetric}% progress. `;
      }
    } else if (isParticipant && hasEnded) {
      message += `${userName} completed the "${challengeTitle}" challenge on Green Compass! `;
    } else if (isActive) {
      message += `${userName} invites you to join the "${challengeTitle}" challenge on Green Compass! `;
    } else {
      message += `${userName} is excited about the upcoming "${challengeTitle}" challenge on Green Compass! `;
    }
  } else {
    if (isParticipant && isActive) {
      message += `I'm participating in the "${challengeTitle}" challenge on Green Compass! `;
      if (progressMetric !== undefined) {
        message += `Currently at ${progressMetric}% progress. `;
      }
    } else if (isParticipant && hasEnded) {
      message += `I completed the "${challengeTitle}" challenge on Green Compass! `;
    } else if (isActive) {
      message += `I'm inviting you to join the "${challengeTitle}" challenge on Green Compass! `;
    } else {
      message += `I'm excited about the upcoming "${challengeTitle}" challenge on Green Compass! `;
    }
  }
  
  // Add challenge details
  const truncatedDescription = challengeDescription.length > 100 
    ? `${challengeDescription.substring(0, 100).trim()}...` 
    : challengeDescription;
  
  message += `\n\n${truncatedDescription}\n\n`;
  
  // Add challenge info
  message += `📅 ${dateRange}\n`;
  message += `👥 ${participantCount} participants\n\n`;
  
  // Add call to action
  if (isActive && !isParticipant) {
    message += `Will you join me in this challenge? Let's make a difference together!\n\n`;
  } else if (!isActive && !hasEnded) {
    message += `The challenge starts soon! Mark your calendar and join me!\n\n`;
  } else {
    message += `Join Green Compass to participate in more sustainability challenges!\n\n`;
  }
  
  // Add hashtags
  message += `#GreenCompass #${challengeTitle.replace(/\s/g, '')} #Sustainability`;
  
  return {
    title,
    message,
    url: 'https://greencompass.eco/challenges' // Placeholder URL
  };
}

export default formatChallengeForSharing;
