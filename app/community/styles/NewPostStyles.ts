import { ViewStyle, TextStyle, StyleSheet, Platform } from 'react-native';

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
  markdownHelpButton: ViewStyle;
  markdownHelpText: TextStyle;
  postInput: TextStyle;
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
  markdownHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  markdownHelpText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 4,
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
    width: 100,
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
