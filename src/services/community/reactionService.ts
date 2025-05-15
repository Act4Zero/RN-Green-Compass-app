import supabase from '../../lib/supabase';
import { helpfulBronzeTrigger, helpfulSilverTrigger, helpfulGoldTrigger } from '@/badges/triggers/community';
import badgesService from './badgesService';
import { fetchUserProfile } from '@/services/profile/fetchUserProfile';

/**
 * Service for managing reactions (likes/upvotes) in the community feed
 */
export const reactionService = {
  /**
   * Toggle a reaction (like/upvote) on a discussion
   */
  toggleDiscussionReaction: async (
    userId: string,
    discussionId: string,
    reactionType: string = 'like'
  ): Promise<boolean> => {
    // Check if the user has already reacted
    const { data: existingReaction, error: checkError } = await supabase
      .from('reactions')
      .select('id')
      .eq('user_id', userId)
      .eq('discussion_id', discussionId)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking existing reaction for discussion ${discussionId}:`, checkError);
      throw checkError;
    }

    // If the user has already reacted, remove the reaction (unlike)
    if (existingReaction) {
      const { error: deleteError } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error(`Error removing reaction for discussion ${discussionId}:`, deleteError);
        throw deleteError;
      }

      return false; // Reaction removed
    }

    // Otherwise, add a new reaction (like)
    const { error: insertError } = await supabase
      .from('reactions')
      .insert({
        user_id: userId,
        discussion_id: discussionId,
        comment_id: null,
        reaction_type: reactionType,
      });

    if (insertError) {
      console.error(`Error adding reaction for discussion ${discussionId}:`, insertError);
      throw insertError;
    }

    return true; // Reaction added
  },

  /**
   * Toggle a reaction (like/upvote) on a comment
   */
  toggleCommentReaction: async (
    userId: string,
    commentId: string,
    reactionType: string = 'like'
  ): Promise<boolean> => {
    // Check if the user has already reacted
    const { data: existingReaction, error: checkError } = await supabase
      .from('reactions')
      .select('id')
      .eq('user_id', userId)
      .eq('comment_id', commentId)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking existing reaction for comment ${commentId}:`, checkError);
      throw checkError;
    }

    // If the user has already reacted, remove the reaction (unlike)
    if (existingReaction) {
      const { error: deleteError } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error(`Error removing reaction for comment ${commentId}:`, deleteError);
        throw deleteError;
      }

      return false; // Reaction removed
    }

    // Otherwise, add a new reaction (like)
    const { error: insertError } = await supabase
      .from('reactions')
      .insert({
        user_id: userId,
        discussion_id: null,
        comment_id: commentId,
        reaction_type: reactionType,
      });

    if (insertError) {
      console.error(`Error adding reaction for comment ${commentId}:`, insertError);
      throw insertError;
    }

    // Badge triggers: check for helpful badges after comment reaction
    try {
      // Get all comments by the user
      const { data: userComments } = await supabase
        .from('comments')
        .select('*')
        .eq('user_id', userId);
      if (Array.isArray(userComments) && userComments.length > 0) {
        const commentIds = userComments.map((c: any) => c.id);
        // Get all reactions for these comments
        const { data: reactions } = await supabase
          .from('reactions')
          .select('*')
          .in('comment_id', commentIds);
        const profile = await fetchUserProfile(userId);
        if (profile && Array.isArray(reactions)) {
          const safeProfile = {
            ...profile,
            login_streak: profile.login_streak ?? 0,
            interests: Array.isArray(profile.interests) ? profile.interests.join(',') : profile.interests,
          };
          const context = {
            userId,
            profile: safeProfile,
            activityLogs: [],
            now: new Date(),
            comments: userComments,
            reactions,
          };
          if (helpfulBronzeTrigger(context)) {
            await badgesService.awardBadgeIfNotExists(userId, 'helpful_bronze');
          }
          if (helpfulSilverTrigger(context)) {
            await badgesService.awardBadgeIfNotExists(userId, 'helpful_silver');
          }
          if (helpfulGoldTrigger(context)) {
            await badgesService.awardBadgeIfNotExists(userId, 'helpful_gold');
          }
        }
      }
    } catch (badgeError) {
      // Log the error but don't fail reaction creation
      console.error('Error checking/awarding helpful badges:', badgeError);
    }

    return true; // Reaction added
  },
};
