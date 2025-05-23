import { ShareableContent } from './shareUtils';

/**
 * Format challenge data for sharing with customized messaging based on challenge status
 * 
 * @param challengeTitle Title of the challenge
 * @param challengeDescription Description of the challenge
 * @param startDate Start date of the challenge
 * @param endDate End date of the challenge
 * @param isParticipant Whether the user is participating in the challenge
 * @param participantCount Number of participants in the challenge
 * @param progressMetric User's progress percentage (if participating)
 * @param userName User's name (for personalization)
 * @returns Formatted share content
 */
export const formatChallengeForSharing = (
  challengeTitle: string,
  challengeDescription: string,
  startDate: Date,
  endDate: Date,
  isParticipant: boolean,
  participantCount: number,
  progressMetric?: number,
  userName?: string
): ShareableContent => {
  // Format dates for display
  const startDateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDateStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dateRange = `${startDateStr} - ${endDateStr}`;
  
  // Check if challenge is active or completed
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;
  const hasEnded = now > endDate;
  
  // Add user context if available
  const userPrefix = userName ? `${userName}` : 'I';
  
  // Generate appropriate message based on the challenge status
  let message = '';
  let title = '';
  
  if (hasEnded && isParticipant) {
    // Completed challenge
    title = `Completed: ${challengeTitle} Challenge`;
    if (progressMetric && progressMetric === 100) {
      message = `${userPrefix} successfully completed the "${challengeTitle}" challenge! This sustainability initiative involved ${participantCount} participants from ${startDateStr} to ${endDateStr}. Join Green Compass for more eco-friendly challenges!`;
    } else {
      message = `${userPrefix} participated in the "${challengeTitle}" challenge that just concluded! It ran from ${startDateStr} to ${endDateStr} with ${participantCount} participants making a positive impact together.`;
    }
  } else if (isActive && isParticipant) {
    // Active and participating
    title = `${challengeTitle} Challenge`;
    message = `${userPrefix}'m currently participating in the "${challengeTitle}" challenge on Green Compass!`;
    if (progressMetric !== undefined) {
      message += ` Currently at ${progressMetric}% progress with ${participantCount} other participants. This challenge runs from ${dateRange} - join me to make a collective impact!`;
    } else {
      message += ` Join me and ${participantCount} others in this sustainability challenge running from ${dateRange}!`;
    }
  } else if (isActive && !isParticipant) {
    // Active but not participating
    title = `Join: ${challengeTitle} Challenge`;
    message = `${userPrefix}'m inviting you to join the "${challengeTitle}" challenge on Green Compass! This sustainability initiative already has ${participantCount} participants and runs until ${endDateStr}. Let's make a difference together!`;
  } else {
    // Upcoming challenge
    title = `Upcoming: ${challengeTitle} Challenge`;
    message = `${userPrefix}'m excited about the upcoming "${challengeTitle}" challenge on Green Compass! It starts on ${startDateStr} and will run until ${endDateStr}. Join me and ${participantCount} others who've already signed up to make a positive environmental impact!`;
  }
  
  // Add a brief description if the message isn't too long
  if (message.length < 180 && challengeDescription) {
    const truncatedDescription = challengeDescription.length > 80
      ? `${challengeDescription.substring(0, 80).trim()}...`
      : challengeDescription;
    
    message += `\n\n"${truncatedDescription}"`;
  }
  
  // Add hashtags
  message += `\n\n#GreenCompass #${challengeTitle.replace(/\s/g, '')} #Sustainability`;
  
  return {
    title,
    message,
    url: 'https://app.greencompass.app' // Could be a dynamic deep link in the future
  };
};

export default formatChallengeForSharing;
