import { discussionService } from './discussionService';
import { commentService } from './commentService';
import { reactionService } from './reactionService';

/**
 * Community service for managing discussions, comments, and reactions
 */
const communityService = {
  ...discussionService,
  ...commentService,
  ...reactionService,
};

export {
  discussionService,
  commentService,
  reactionService,
};

export default communityService;
