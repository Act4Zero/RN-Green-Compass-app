import { Alert, Platform } from 'react-native';
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
  console.log(`[DELETE UTILITY] Called with postId: ${postId}, userId: ${userId}`, { postId, userId });
  
  try {
    // 1. First verify the post exists and is owned by this user
    console.log(`[DELETE UTILITY] Verifying post ownership`);
    const { data: post, error: fetchError } = await supabase
      .from('discussions')
      .select('user_id, title')
      .eq('id', postId)
      .single();
    
    // Log the complete response for debugging
    console.log(`[DELETE UTILITY] Post verification response:`, { post, error: fetchError });
      
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
    console.log(`[DELETE UTILITY] Checking ownership: post owner ${post.user_id} vs requester ${userId}`);
    if (post.user_id !== userId) {
      const err = new Error(`You don't have permission to delete this post`);
      console.error(`[DELETE UTILITY] User ${userId} attempted to delete post owned by ${post.user_id}`);
      if (onError) onError(err);
      return false;
    }
    
    // 3. Delete the post directly
    console.log(`[DELETE UTILITY] Ownership verified, deleting post ${postId}`);
    const { data: deleteData, error: deleteError } = await supabase
      .from('discussions')
      .delete()
      .eq('id', postId)
      .select();
      
    // Log the complete delete response
    console.log(`[DELETE UTILITY] Delete response:`, { data: deleteData, error: deleteError });
    
    if (deleteError) {
      console.error(`[DELETE UTILITY] Error deleting post: ${deleteError.message}`, deleteError);
      if (onError) onError(deleteError);
      return false;
    }
    
    // 4. Success!
    console.log(`[DELETE UTILITY] Successfully deleted post ${postId} with title: ${post.title}`);
    if (onSuccess) onSuccess();
    return true;
    
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error deleting post');
    console.error(`[DELETE UTILITY] Unexpected error:`, error);
    if (onError) onError(err);
    return false;
  }
};

/**
 * Shows a confirmation dialog and handles post deletion
 * Now with enhanced error handling for web and mobile
 */
export const confirmAndDeletePost = (
  postId: string,
  userId: string,
  onSuccess?: () => void,
  onError?: (message: string) => void
) => {
  console.log(`[DELETE UTILITY] Showing confirmation dialog for post ${postId}`);
  
  // Function to execute on delete confirmation
  const executeDelete = async () => {
    console.log(`[DELETE UTILITY] Deletion confirmed for post ${postId}`);
    
    const success = await deletePost(
      postId, 
      userId,
      () => {
        console.log(`[DELETE UTILITY] Success callback triggered`);
        if (onSuccess) onSuccess();
      },
      (error) => {
        console.error(`[DELETE UTILITY] Error in deletion: ${error.message}`);
        if (onError) onError(error.message);
      }
    );
    
    console.log(`[DELETE UTILITY] Deletion result for post ${postId}: ${success ? 'Success' : 'Failed'}`);
    
    // Ensure the onSuccess callback is called if deletePost returns true
    if (success && onSuccess) {
      console.log(`[DELETE UTILITY] Ensuring onSuccess is called`);
      onSuccess();
    }
  };
  
  // Use platform-specific approach for better reliability
  if (Platform.OS === 'web') {
    // For web, use the browser's confirm dialog which is more reliable
    console.log(`[DELETE UTILITY] Using browser confirmation for web platform`);
    const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    
    if (confirmed) {
      console.log(`[DELETE UTILITY] Browser confirmation accepted, proceeding with deletion`);
      executeDelete();
    } else {
      console.log(`[DELETE UTILITY] Browser confirmation rejected, deletion cancelled`);
    }
  } else {
    // For mobile, use React Native's Alert
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log(`[DELETE UTILITY] Deletion cancelled for post ${postId}`)
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: executeDelete
        }
      ]
    );
  }
};
