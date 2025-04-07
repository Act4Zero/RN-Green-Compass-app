
import { ViewStyle, TextStyle, StyleSheet } from 'react-native';

interface ProfileEditStyles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  pageContainer: ViewStyle;
  pageHeader: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
}

const profileEditStyles = StyleSheet.create<ProfileEditStyles>({
    keyboardAvoidingContainer: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    scrollContent: {
      flexGrow: 1,
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#555555',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#F5F5F5',
    },
    errorText: {
      fontSize: 16,
      color: '#D32F2F',
      textAlign: 'center',
    },
    pageContainer: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    pageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    backButton: {
      marginRight: 16,
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
  });

  export default profileEditStyles;
  