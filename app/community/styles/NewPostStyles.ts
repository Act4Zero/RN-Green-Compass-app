import { ViewStyle, TextStyle, StyleSheet, Platform } from 'react-native';

// Define markdown styles separately to avoid TypeScript errors with the Markdown component
export const markdownStyles = StyleSheet.create({
  // Text styles
  body: {
    color: '#333333',
    fontSize: 16,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  link: {
    color: '#2E7D32',
    textDecorationLine: 'underline',
  },
  // Block styles
  paragraph: {
    marginVertical: 8,
    paddingHorizontal: 0,
  },
  blockquote: {
    backgroundColor: '#F5F5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 8,
  },
  code_block: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
  code_inline: {
    backgroundColor: '#F5F5F5',
    padding: 4,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
  // We need to handle images separately in the component
});

export interface NewPostStyles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  inputContainer: ViewStyle;
  inputHeader: ViewStyle;
  inputLabel: TextStyle;
  inputActions: ViewStyle;
  markdownHelpButton: ViewStyle;
  markdownHelpText: TextStyle;
  previewButton: ViewStyle;
  previewButtonText: TextStyle;
  titleInput: TextStyle;
  postInput: TextStyle;
  inputLimitReached: TextStyle;
  characterCountContainer: ViewStyle;
  characterCount: TextStyle;
  characterCountWarning: TextStyle;
  characterCountLimit: TextStyle;
  previewContainer: ViewStyle;
  previewScroll: ViewStyle;
  previewPlaceholder: TextStyle;
  submitButton: ViewStyle;
  submitButtonDisabled: ViewStyle;
  submitButtonText: TextStyle;
  markdownHelpContainer: ViewStyle;
  markdownHelpTitle: TextStyle;
  markdownHelpItem: ViewStyle;
  markdownHelpCode: TextStyle;
  markdownHelpDescription: TextStyle;
  loadingContainer: ViewStyle;
}

const NewPostStyles = StyleSheet.create<NewPostStyles>({
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
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markdownHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginRight: 12,
  },
  markdownHelpText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 4,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  previewButtonText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 4,
  },
  titleInput: {
    fontSize: 16,
    color: '#333333',
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  postInput: {
    fontSize: 16,
    color: '#333333',
    minHeight: 150,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  inputLimitReached: {
    borderColor: '#D32F2F',
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#757575',
  },
  characterCountWarning: {
    color: '#FF9800',
  },
  characterCountLimit: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  previewContainer: {
    minHeight: 150,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  previewScroll: {
    maxHeight: 300,
  },
  previewPlaceholder: {
    fontSize: 16,
    color: '#999999',
    fontStyle: 'italic',
    padding: 8,
  },

  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  markdownHelpContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginBottom: 16,
  },
  markdownHelpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  markdownHelpItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  markdownHelpCode: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#F5F5F5',
    padding: 4,
    borderRadius: 4,
    marginRight: 12,
    width: 200,
  },
  markdownHelpDescription: {
    fontSize: 14,
    color: '#555555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});

export default NewPostStyles;
