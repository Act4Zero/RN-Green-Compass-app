import { ViewStyle, TextStyle, ImageStyle, StyleSheet } from 'react-native';

export interface FeedStyles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  postsContainer: ViewStyle;
  postItem: ViewStyle;
  postHeader: ViewStyle;
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
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    padding: 16,
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
