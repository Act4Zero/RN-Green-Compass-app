/**
 * Community service for interacting with the community feed
 * 
 * This file is a facade that re-exports the modular community services.
 * For detailed implementations, see the individual service files in the community directory.
 */
import communityService, {
  discussionService,
  commentService,
  reactionService
} from './community';

export {
  discussionService,
  commentService,
  reactionService
};

export default communityService;
