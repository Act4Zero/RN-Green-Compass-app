/**
 * Utility functions for formatting leaderboard data for sharing
 */

interface LeaderboardShareContent {
  title: string;
  message: string;
  url?: string;
  imageUrl?: string;
}

/**
 * Formats leaderboard data for sharing
 * 
 * @param rank User's current rank
 * @param displayName User's display name
 * @param totalPoints User's total points (for points leaderboard)
 * @param leaderboardType Type of leaderboard ('points' or 'streak')
 * @param leaderboardScope Scope of leaderboard ('friends', 'groups', 'community')
 * @param longestStreak User's longest streak (for streak leaderboard)
 * @param currentStreak User's current streak (for streak leaderboard)
 * @param totalEntries Total number of people on the leaderboard
 * @param nextMilestone Information about the next milestone (if available)
 * @returns Formatted sharing content
 */
export function formatLeaderboardForSharing(
  rank: number,
  displayName: string,
  totalPoints?: number,
  leaderboardType: 'points' | 'streak' = 'points',
  leaderboardScope: 'friends' | 'groups' | 'community' = 'community',
  longestStreak?: number,
  currentStreak?: number,
  totalEntries?: number,
  nextMilestone?: {
    rank: number;
    pointsNeeded?: number;
    daysNeeded?: number;
    user?: {
      displayName: string;
      userId: string;
    };
  }
): LeaderboardShareContent {
  // Create a title based on user's rank and leaderboard type
  let title = '';
  
  if (rank === 1) {
    title = `#1 on the ${leaderboardType === 'points' ? 'Impact' : 'Streak'} Leaderboard!`;
  } else {
    title = `Ranked #${rank} on the ${leaderboardType === 'points' ? 'Impact' : 'Streak'} Leaderboard`;
  }
  
  // Create the sharing message
  let message = '';
  
  // Personal achievement
  if (leaderboardType === 'points') {
    message += `I'm ranked #${rank} in sustainability impact on Green Compass with ${totalPoints} points`;
    
    if (totalEntries) {
      message += ` (out of ${totalEntries} participants)`;
    }
    
    message += '! ';
    
    // Add motivational content about next milestone if available
    if (nextMilestone && nextMilestone.pointsNeeded && nextMilestone.pointsNeeded > 0) {
      if (nextMilestone.user) {
        message += `Only ${nextMilestone.pointsNeeded} more points to catch up with ${nextMilestone.user.displayName} at rank #${nextMilestone.rank}. `;
      } else {
        message += `Just ${nextMilestone.pointsNeeded} more points until rank #${nextMilestone.rank}! `;
      }
    }
  } else {
    // Streak leaderboard
    if (longestStreak && currentStreak) {
      message += `I'm ranked #${rank} on Green Compass with a ${longestStreak}-day longest streak`;
      
      if (currentStreak > 0) {
        message += ` (current streak: ${currentStreak} days)`;
      }
      
      if (totalEntries) {
        message += ` out of ${totalEntries} participants`;
      }
      
      message += '! ';
      
      // Add motivational content about next milestone if available
      if (nextMilestone && nextMilestone.daysNeeded && nextMilestone.daysNeeded > 0) {
        if (nextMilestone.user) {
          message += `Only ${nextMilestone.daysNeeded} more days to catch up with ${nextMilestone.user.displayName} at rank #${nextMilestone.rank}. `;
        } else {
          message += `Just ${nextMilestone.daysNeeded} more days until rank #${nextMilestone.rank}! `;
        }
      }
    }
  }
  
  // Call to action
  message += 'Join me in making sustainable choices every day and see how you rank! ';
  
  // Add scope-specific message
  if (leaderboardScope === 'friends') {
    message += 'Challenge your friends to beat my score. ';
  } else if (leaderboardScope === 'groups') {
    message += 'Our group is making a real difference! ';
  } else {
    message += 'Every action counts toward a more sustainable world. ';
  }
  
  // Add hashtags
  message += '\n\n#GreenCompass #Sustainability';
  
  if (leaderboardType === 'points') {
    message += ' #ImpactLeader';
  } else {
    message += ' #StreakChampion';
  }
  
  if (rank === 1) {
    message += ' #TopRanked';
  } else if (rank <= 3) {
    message += ' #TopThree';
  } else if (rank <= 10) {
    message += ' #TopTen';
  }
  
  return {
    title,
    message,
    url: 'https://greencompass.eco/leaderboards' // Placeholder URL
  };
}

export default formatLeaderboardForSharing;
