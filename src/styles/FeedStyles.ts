import { ViewStyle, TextStyle, ImageStyle, StyleSheet } from 'react-native';

export interface FeedStyles {
  // Layout styles
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  emptyStateWrapper: ViewStyle;
  
  // Header styles
  header: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  
  // Feature card styles
  featureCardsContainer: ViewStyle;
  featureCard: ViewStyle;
  featureCardContent: ViewStyle;
  featureCardIcon: ViewStyle;
  featureCardTextContainer: ViewStyle;
  featureCardTitle: TextStyle;
  featureCardDescription: TextStyle;
  featureCardButton: ViewStyle;
  featureCardButtonText: TextStyle;
  
  // Section styles
  sectionHeader: ViewStyle;
  sectionTitle: TextStyle;
  sectionSubtitle: TextStyle;
  
  // Legacy button styles (kept for backwards compatibility)
  challengesButton: ViewStyle;
  challengesButtonText: TextStyle;
  
  // Posts container
  postsContainer: ViewStyle;
  postItem: ViewStyle;
  postHeader: ViewStyle;
  postHeaderRight: ViewStyle;
  authorContainer: ViewStyle;
  authorAvatar: ImageStyle;
  defaultAvatar: ViewStyle;
  defaultAvatarText: TextStyle;
  postAuthor: TextStyle;
  postTimestamp: TextStyle;
  postTitle: TextStyle;
  postContent: TextStyle;
  postFooter: ViewStyle;
  reactionButton: ViewStyle;
  reactionButtonActive: ViewStyle;
  reactionText: TextStyle;
  reactionTextActive: TextStyle;
  commentButton: ViewStyle;
  commentText: TextStyle;
  divider: ViewStyle;
  
  // Post options
  menuOverlay: ViewStyle;
  optionsButton: ViewStyle;
  optionsMenu: ViewStyle;
  optionItem: ViewStyle;
  optionText: TextStyle;
  
  newPostButton: ViewStyle;
  newPostButtonText: TextStyle;
  noPostsContainer: ViewStyle;
  noPostsText: TextStyle;
  loadingContainer: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
  toastWrapper: ViewStyle;
  toastContainer: ViewStyle;
  toastText: TextStyle;
}

const FeedStyles = StyleSheet.create<FeedStyles>({
  // Layout styles
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    width: '100%',
    maxWidth: 900,
    padding: 16,
  },
  emptyStateWrapper: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  // Feature card styles
  featureCardsContainer: {
    marginBottom: 24,
    gap: 16,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureCardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureCardTextContainer: {
    flex: 1,
  },
  featureCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  featureCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  featureCardButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
  },
  
  // Section styles
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  
  // Legacy button styles (kept for backwards compatibility)
  challengesButton: {
    backgroundColor: '#43A047',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    marginTop: 10,
    marginHorizontal: 0,
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  challengesButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
  },
  postsContainer: {
    marginTop: 16,
    gap: 16,
  },
  postItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  
  // Post options
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 9999,
  },
  optionsButton: {
    marginLeft: 8,
    padding: 4,
  },
  optionsMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1, 
    borderColor: '#E0E0E0',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10000,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2E7D32',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  defaultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  defaultAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  postTimestamp: {
    fontSize: 14,
    color: '#757575',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
    lineHeight: 22,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  reactionButtonActive: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  reactionText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  reactionTextActive: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 4,
    fontWeight: '500',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  newPostButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 28,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  newPostButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  noPostsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 16,
  },
  noPostsText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  toastWrapper: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  toastContainer: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: '85%',
    maxWidth: 500,
  },
  toastText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default FeedStyles;
