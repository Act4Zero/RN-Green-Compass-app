/**
 * Utility functions for formatting community post data for sharing
 */

interface CommunityPostShareContent {
  title: string;
  message: string;
  url?: string;
  imageUrl?: string;
}

/**
 * Formats community post data for sharing
 * 
 * @param postTitle Title of the post (if any)
 * @param postContent Content of the post
 * @param authorName Author's name
 * @param userName Current user's name (for personalization)
 * @returns Formatted sharing content
 */
export function formatCommunityPostForSharing(
  postTitle: string | null,
  postContent: string,
  authorName: string,
  userName?: string
): CommunityPostShareContent {
  // Create a title - use post title or fallback to a generic title
  const title = postTitle || 'Green Compass Community Post';
  
  // Format the content with author attribution
  // Limit the content length for sharing
  const maxContentLength = 200;
  const truncatedContent = postContent.length > maxContentLength
    ? `${postContent.substring(0, maxContentLength).trim()}...`
    : postContent;
  
  // Create the sharing message 
  let message = `"${truncatedContent}" - ${authorName} via Green Compass\n\n`;
  
  // Add an invitation to join the conversation
  message += `Join the conversation about sustainable living on Green Compass!`;
  
  // Hashtags for better social sharing
  message += `\n\n#GreenCompass #Sustainability #SustainableLiving`;
  
  return {
    title,
    message,
    // URL could be a deep link to the post
    url: 'https://greencompass.eco/community' // Placeholder URL - could be a deep link in the future
  };
}

export default formatCommunityPostForSharing;
