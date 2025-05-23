import { ShareableContent } from './shareUtils';

/**
 * Format dashboard stats for sharing with customized messaging
 * 
 * @param totalActions Number of actions taken by the user
 * @param totalCO2Saved Amount of CO2 saved in kg
 * @param overallStreak Current streak count in days
 * @param userName Optional user name to include
 * @returns Formatted share content
 */
export const formatDashboardForSharing = (
  totalActions: number,
  totalCO2Saved: number,
  overallStreak: number,
  userName?: string
): ShareableContent => {
  // Format numbers for display
  const formattedCO2 = totalCO2Saved.toFixed(1);
  
  // Generate appropriate message based on the stats
  let message = '';
  
  // Add user context if available
  const userPrefix = userName ? `${userName}` : 'I';
  
  // Generate different messages based on which stat is most impressive
  if (overallStreak > 7) {
    // Streak-focused message for streaks over a week
    message = `${userPrefix}'ve maintained a ${overallStreak}-day sustainability streak with Green Compass! So far, ${userPrefix.toLowerCase()}'ve taken ${totalActions} eco-friendly actions and saved ${formattedCO2} kg of CO₂. Join me in making daily choices for a healthier planet!`;
  } else if (totalCO2Saved > 50) {
    // CO2-focused message for significant savings
    message = `${userPrefix}'ve saved ${formattedCO2} kg of CO₂ through ${totalActions} sustainable actions with Green Compass! That's equivalent to planting ${Math.round(totalCO2Saved/22)} trees. Want to track your environmental impact too?`;
  } else {
    // General message for other cases
    message = `${userPrefix}'ve taken ${totalActions} sustainable actions and saved ${formattedCO2} kg of CO₂ with Green Compass! Small daily choices add up to meaningful environmental impact. Join me?`;
  }

  return {
    title: 'My Green Compass Impact',
    message,
    url: 'https://app.greencompass.app', // Could be a dynamic deep link in the future
  };
};
