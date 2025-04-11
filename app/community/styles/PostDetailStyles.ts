import { ViewStyle, TextStyle, StyleSheet } from 'react-native';

export interface PostDetailStyles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  postContainer: ViewStyle;
  postHeader: ViewStyle;
  postAuthor: TextStyle;
  postTimestamp: TextStyle;
  postTitle: TextStyle;
  postContent: TextStyle;
  postFooter: ViewStyle;
  likeButton: ViewStyle;
  likeButtonActive: ViewStyle;
  likeText: TextStyle;
  likeTextActive: TextStyle;
  commentsContainer: ViewStyle;
  commentsTitle: TextStyle;
  commentItem: ViewStyle;
  commentHeader: ViewStyle;
  commentAuthor: TextStyle;
  commentTimestamp: TextStyle;
  commentContent: TextStyle;
  noCommentsContainer: ViewStyle;
  noCommentsText: TextStyle;
  loadingCommentsContainer: ViewStyle;
  loadingCommentsText: TextStyle;
  errorCommentsContainer: ViewStyle;
  errorCommentsText: TextStyle;
  addCommentContainer: ViewStyle;
  commentInput: TextStyle;
  commentInputAtLimit: TextStyle;
  commentInputFooter: ViewStyle;
  characterCount: TextStyle;
  characterCountNearLimit: TextStyle;
  characterCountAtLimit: TextStyle;
  submitButton: ViewStyle;
  submitButtonDisabled: ViewStyle;
  submitButtonText: TextStyle;
  toastWrapper: ViewStyle;
  toastContainer: ViewStyle;
  toastText: TextStyle;
  loadingContainer: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  backButtonText: TextStyle;
}

const PostDetailStyles = StyleSheet.create<PostDetailStyles>({
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  postContainer: {
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  likeButtonActive: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  likeText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  likeTextActive: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 4,
    fontWeight: '500',
  },
  commentsContainer: {
    marginBottom: 16,
  },
  loadingCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loadingCommentsText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  errorCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  errorCommentsText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  commentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#757575',
  },
  commentContent: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  noCommentsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCommentsText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  addCommentContainer: {
    marginBottom: 32,
  },
  commentInputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#757575',
  },
  characterCountNearLimit: {
    color: '#FFA000',
  },
  characterCountAtLimit: {
    color: '#D32F2F',
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    fontSize: 14,
    minHeight: 48,
    maxHeight: 120,
  },
  commentInputAtLimit: {
    borderColor: '#D32F2F',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    height: 48,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
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
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default PostDetailStyles;
