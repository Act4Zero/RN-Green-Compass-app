import { ViewStyle, TextStyle, StyleSheet } from 'react-native';

export interface ChallengeStyles {
  // Layout styles
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  
  // Header components
  backButton: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  
  // Challenges list
  challengesContainer: ViewStyle;
  challengeCard: ViewStyle;
  challengeHeader: ViewStyle;
  challengeTitle: TextStyle;
  challengeDescription: TextStyle;
  challengeMeta: ViewStyle;
  challengeMetaText: TextStyle;
  challengeDates: TextStyle;
  participantCount: TextStyle;
  
  // Challenge details
  detailCard: ViewStyle;
  detailHeader: ViewStyle;
  detailTitle: TextStyle;
  detailDescription: TextStyle;
  detailMeta: ViewStyle;
  detailDates: TextStyle;
  creatorInfo: ViewStyle;
  creatorName: TextStyle;
  
  // Progress tracking
  progressContainer: ViewStyle;
  progressLabel: TextStyle;
  progressBarContainer: ViewStyle;
  progressBarFill: ViewStyle;
  progressValue: TextStyle;
  progressText: TextStyle;
  
  // Actions
  actionContainer: ViewStyle;
  joinButton: ViewStyle;
  joinButtonText: TextStyle;
  logButton: ViewStyle;
  logButtonText: TextStyle;
  
  // Activity logs
  logsContainer: ViewStyle;
  logItem: ViewStyle;
  logTitle: TextStyle;
  logDescription: TextStyle;
  logDate: TextStyle;
  
  // Empty and loading states
  emptyStateContainer: ViewStyle;
  emptyStateText: TextStyle;
  loadingContainer: ViewStyle;
  
  // Participants
  participantsContainer: ViewStyle;
  participantItem: ViewStyle;
  participantName: TextStyle;
  participantAvatar: ViewStyle;
  
  // Filter tabs
  filterTabs: ViewStyle;
  filterTab: ViewStyle;
  filterTabActive: ViewStyle;
  filterTabText: TextStyle;
  filterTabTextActive: TextStyle;
}

const ChallengeStyles = StyleSheet.create<ChallengeStyles>({
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  // Header components
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
  
  // Challenges list
  challengesContainer: {
    marginTop: 8,
    gap: 16,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeHeader: {
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 12,
  },
  challengeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  challengeMetaText: {
    fontSize: 12,
    color: '#777777',
  },
  challengeDates: {
    fontSize: 12,
    color: '#777777',
  },
  participantCount: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  
  // Challenge details
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailHeader: {
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
    lineHeight: 24,
  },
  detailMeta: {
    marginTop: 8,
    marginBottom: 16,
  },
  detailDates: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  creatorName: {
    fontSize: 14,
    color: '#555555',
    marginLeft: 8,
  },
  
  // Progress tracking
  progressContainer: {
    marginVertical: 16,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressValue: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    color: '#555555',
    marginTop: 4,
  },
  
  // Actions
  actionContainer: {
    marginVertical: 16,
  },
  joinButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logButton: {
    backgroundColor: '#81C784',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Activity logs
  logsContainer: {
    marginTop: 16,
  },
  logItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  logDescription: {
    fontSize: 12,
    color: '#555555',
  },
  logDate: {
    fontSize: 10,
    color: '#888888',
    marginTop: 4,
    textAlign: 'right',
  },
  
  // Empty and loading states
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  
  // Participants
  participantsContainer: {
    marginTop: 16,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  participantName: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 12,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  
  // Filter tabs
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filterTabActive: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  filterTabText: {
    fontSize: 14,
    color: '#777777',
  },
  filterTabTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
});

export default ChallengeStyles;
