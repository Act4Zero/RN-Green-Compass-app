/**
 * Utility functions for formatting habit history data for sharing
 */

interface HabitHistoryShareContent {
  title: string;
  message: string;
  url?: string;
  imageUrl?: string;
}

/**
 * Formats habit history data for sharing
 * 
 * @param totalActions Total number of actions taken
 * @param totalCO2Saved Total CO2 saved in kg
 * @param overallStreak Current streak in days 
 * @param selectedDate Selected date (if any)
 * @param userName User's name/identifier for personalization
 * @returns Formatted sharing content
 */
export function formatHabitHistoryForSharing(
  totalActions: number,
  totalCO2Saved: number,
  overallStreak: number,
  selectedDate?: Date | string | null,
  userName?: string
): HabitHistoryShareContent {
  // Format date if provided
  let dateString = '';
  
  if (selectedDate) {
    if (selectedDate instanceof Date) {
      dateString = ` on ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    } else if (typeof selectedDate === 'string') {
      // Try to parse the string into a date
      try {
        const parsedDate = new Date(selectedDate);
        if (!isNaN(parsedDate.getTime())) { // Check if valid date
          dateString = ` on ${parsedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }
      } catch (e) {
        // If parsing fails, just use the string as is
        dateString = selectedDate ? ` on ${selectedDate}` : '';
      }
    }
  }
  
  // Create achievement title
  const title = `${totalActions} Actions · ${totalCO2Saved.toFixed(1)} kg CO₂ Saved · ${overallStreak} Day Streak`;
  
  // Create personalized message based on achievements
  let message = '';
  
  // Add personalized greeting if username is available
  if (userName) {
    message += `${userName} is making a difference with Green Compass! `;
  } else {
    message += `I'm making a difference with Green Compass! `;
  }
  
  // Highlight specific achievements
  if (totalActions > 0) {
    message += `I've completed ${totalActions} sustainable actions${dateString}. `;
  }
  
  if (totalCO2Saved > 0) {
    message += `I've saved ${totalCO2Saved.toFixed(1)} kg of CO₂. `;
  }
  
  if (overallStreak > 1) {
    message += `I'm on a ${overallStreak}-day sustainability streak! `;
  }
  
  // Call to action
  message += `Join me in making eco-friendly choices every day! #GreenCompass #Sustainability`;
  
  return {
    title,
    message,
    // URL could be a deep link to the app or website
    url: 'https://greencompass.eco' // Placeholder URL
  };
}

export default formatHabitHistoryForSharing;
