import supabase from '../lib/supabase';

/**
 * Global utility function to delete a post
 * This bypasses all hook complexity and directly calls Supabase
 */
export const deletePost = async (
  postId: string, 
  userId: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<boolean> => {
  try {
    // 1. First verify the post exists and is owned by this user
    const { data: post, error: fetchError } = await supabase
      .from('discussions')
      .select('user_id, title')
      .eq('id', postId)
      .single();
    
    if (fetchError) {
      console.error(`[DELETE UTILITY] Error fetching post: ${fetchError.message}`, fetchError);
      if (onError) onError(fetchError);
      return false;
    }
    
    if (!post) {
      const err = new Error(`Post ${postId} not found`);
      console.error(`[DELETE UTILITY] ${err.message}`);
      if (onError) onError(err);
      return false;
    }
    
    // 2. Verify ownership
    if (post.user_id !== userId) {
      const err = new Error(`You don't have permission to delete this post`);
      console.error(`[DELETE UTILITY] User ${userId} attempted to delete post owned by ${post.user_id}`);
      if (onError) onError(err);
      return false;
    }
    
    // 3. Delete the post directly
    const { data: deleteData, error: deleteError } = await supabase
      .from('discussions')
      .delete()
      .eq('id', postId)
      .select();
      
    if (deleteError) {
      console.error(`[DELETE UTILITY] Error deleting post: ${deleteError.message}`, deleteError);
      if (onError) onError(deleteError);
      return false;
    }
    
    // 4. Success!
    if (onSuccess) onSuccess();
    return true;
    
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error deleting post');
    console.error(`[DELETE UTILITY] Unexpected error:`, error);
    if (onError) onError(err);
    return false;
  }
};

// This function has been deprecated in favor of direct deletePost usage with component-handled confirmation
// Components should use the notification system for confirmation UI and then call deletePost directly
// DEPRECATED - Will be removed in a future version
export const confirmAndDeletePost = (
  postId: string,
  userId: string,
  onSuccess?: () => void,
  onError?: (message: string) => void
) => {
  console.warn('confirmAndDeletePost is deprecated. Components should handle their own confirmation UI');
  console.warn('See documentation for proper usage with notification system');
  
  // Call deletePost directly - no confirmation
  return deletePost(
    postId, 
    userId,
    onSuccess,
    // Adapt the error callback to match expected type
    onError ? (error: Error) => onError(error.message) : undefined
  );
};
