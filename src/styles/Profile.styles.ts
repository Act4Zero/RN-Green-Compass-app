import { ViewStyle, TextStyle, ImageStyle, StyleSheet } from 'react-native';

interface ProfileStyles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  scrollContentContainer: ViewStyle;
  contentContainer: ViewStyle;
  pageHeader: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  
  // Profile Card
  profileCard: ViewStyle;
  avatarContainer: ViewStyle;
  avatar: ImageStyle;
  avatarPlaceholder: ViewStyle;
  avatarPlaceholderText: TextStyle;
  nameContainer: ViewStyle;
  displayName: TextStyle;
  anonymousIndicator: TextStyle;
  editButton: ViewStyle;
  editButtonText: TextStyle;
  
  // Section Containers
  sectionContainer: ViewStyle;
  sectionTitle: TextStyle;
  
  // Interests
  interestsContainer: ViewStyle;
  interestItem: ViewStyle;
  interestText: TextStyle;
  emptyInterestsText: TextStyle;
  
  // Loading & Error States
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  loadingPoints: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  
  // Sign Out
  signOutButton: ViewStyle;
  signOutButtonText: TextStyle;
  
  // Points section styles
  pointsSection: ViewStyle;
  pointsSummaryCard: ViewStyle;
  pointsRow: ViewStyle;
  pointsCol: ViewStyle;
  pointsValue: TextStyle;
  pointsLabel: TextStyle;
  pointsDivider: ViewStyle;
  streakValue: TextStyle;
  streakLabel: TextStyle;
  
  // Points History
  pointsHistoryContainer: ViewStyle;
  historyListContainer: ViewStyle;
  historyDateGroup: ViewStyle;
  filterContainer: ViewStyle;
  filterScrollView: ViewStyle;
  filterChip: ViewStyle;
  filterChipActive: ViewStyle;
  filterChipText: TextStyle;
  filterChipTextActive: TextStyle;
  historyList: ViewStyle;
  historyItem: ViewStyle;
  historyItemHeader: ViewStyle;
  historyItemContent: ViewStyle;
  pointSourceIcon: ViewStyle;
  pointsAmount: TextStyle;
  pointsDescription: TextStyle;
  historyDate: TextStyle;
  historyItemDate: TextStyle;
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
  refreshButton: ViewStyle;
  refreshButtonText: TextStyle;
}

const profileStyles = StyleSheet.create<ProfileStyles>({
    keyboardAvoidingContainer: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    scrollContent: {
      flexGrow: 1,
    },
    scrollContentContainer: {
      flexGrow: 1,
      padding: 16,
      paddingBottom: 40,
      alignItems: 'center',
    },
    contentContainer: {
      width: '100%',
      maxWidth: 700,
    },
    pageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      width: '100%',
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
    
    // Profile Card
    profileCard: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
      width: '100%',
    },
    avatarContainer: {
      marginBottom: 15,
      alignItems: 'center',
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
    avatarPlaceholderText: {
      fontSize: 40,
      fontWeight: 'bold',
      color: '#2E7D32',
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
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 20,
    },
    editButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    // Section Containers
    sectionContainer: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#333333',
      alignSelf: 'flex-start',
    },
    
    // Interests
    interestsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 10,
      alignItems: 'flex-start',
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
    emptyInterestsText: {
      color: '#888888',
      fontStyle: 'italic',
    },
    // Loading & Error States
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
    loadingPoints: {
      padding: 20,
      alignItems: 'center',
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
    
    // Sign Out
    signOutButton: {
      backgroundColor: 'transparent',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      marginBottom: 40,
      borderWidth: 1,
      borderColor: '#2E7D32',
      flexDirection: 'row',
      alignSelf: 'center',
      width: '50%',
    },
    signOutButtonText: {
      color: '#2E7D32',
      fontSize: 16,
      fontWeight: '600',
    },
  // Points section styles
  pointsSection: {
    marginTop: 20,
    marginBottom: 16,
    width: '100%',
  },
  pointsSummaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  pointsCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#555555',
    marginTop: 4,
  },
  pointsDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  streakLabel: {
    fontSize: 14,
    color: '#555555',
    marginTop: 4,
  },
  pointsHistoryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
    width: '100%',
  },
  // Points History Section
  historyListContainer: {
    width: '100%',
  },
  historyDateGroup: {
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterScrollView: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  filterChipText: {
    color: '#555555',
  },
  filterChipTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  historyList: {
    width: '100%',
  },
  historyItem: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 12,
  },
  historyItemHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyItemContent: {
    flex: 1,
  },
  pointSourceIcon: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  pointsDescription: {
    fontSize: 14,
    color: '#555555',
  },
  historyDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 12,
  },
  historyItemDate: {
    fontSize: 12,
    color: '#888888',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
  },
  refreshButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  });

  export default profileStyles;