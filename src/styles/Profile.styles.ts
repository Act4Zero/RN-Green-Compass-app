import { ViewStyle, TextStyle, ImageStyle, StyleSheet } from "react-native";

interface ProfileStyles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  pageContainer: ViewStyle;
  pageHeader: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  avatarContainer: ViewStyle;
  avatar: ImageStyle;
  avatarPlaceholder: ViewStyle;
  nameContainer: ViewStyle;
  displayName: TextStyle;
  anonymousIndicator: TextStyle;
  editButton: ViewStyle;
  editButtonText: TextStyle;
  sectionTitle: TextStyle;
  interestsContainer: ViewStyle;
  interestItem: ViewStyle;
  interestText: TextStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  signOutButton: ViewStyle;
  signOutButtonText: TextStyle;
}

const profileStyles = StyleSheet.create<ProfileStyles>({
    keyboardAvoidingContainer: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    scrollContent: {
      flexGrow: 1,
      padding: 16,
    },
    pageContainer: {
      flex: 1,
      alignItems: 'center',
      marginBottom: 30,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
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
    avatarContainer: {
      marginBottom: 15,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    avatarPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(46, 125, 50, 0.1)', // Match app green with opacity
      justifyContent: 'center',
      alignItems: 'center',
    },
    nameContainer: {
      alignItems: 'center',
      marginBottom: 15,
    },
    displayName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2E7D32',
    },
    anonymousIndicator: {
      marginTop: 5,
      fontSize: 14,
      color: '#555555',
      fontStyle: 'italic',
    },
    editButton: {
      backgroundColor: '#2E7D32',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
    },
    editButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#333333',
    },
    interestsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 30,
    },
    interestItem: {
      backgroundColor: '#E8F5E9', 
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      margin: 4,
      borderWidth: 1,
      borderColor: 'rgba(46, 125, 50, 0.3)',
    },
    interestText: {
      color: '#2E7D32',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
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
    signOutButton: {
      backgroundColor: 'transparent',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
      borderWidth: 1,
      borderColor: '#2E7D32',
    },
    signOutButtonText: {
      color: '#2E7D32',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  export default profileStyles;