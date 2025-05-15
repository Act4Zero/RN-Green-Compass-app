import { ViewStyle, TextStyle, StyleSheet } from 'react-native';

export interface LeaderboardStyles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  filtersContainer: ViewStyle;
  filterTypeContainer: ViewStyle;
  filterButton: ViewStyle;
  filterButtonActive: ViewStyle;
  filterButtonText: TextStyle;
  filterButtonActiveText: TextStyle;
  leaderboardContainer: ViewStyle;
  leaderboardHeader: ViewStyle;
  leaderboardTitle: TextStyle;
  refreshButton: ViewStyle;
  divider: ViewStyle;
  entryContainer: ViewStyle;
  entryContainerHighlighted: ViewStyle;
  entryRank: TextStyle;
  entryRankHighlighted: TextStyle;
  entryAvatar: ViewStyle;
  entryContent: ViewStyle;
  entryName: TextStyle;
  entryNameCurrent: TextStyle;
  entryValue: TextStyle;
  entryValueCurrent: TextStyle;
  motivationalContainer: ViewStyle;
  motivationalText: TextStyle;
  loadMoreButton: ViewStyle;
  loadMoreButtonText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  loadingContainer: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
}

export default StyleSheet.create<LeaderboardStyles>({
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
    maxWidth: 500,
    padding: 24,
  },
  header: {
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
  filtersContainer: {
    marginBottom: 24,
  },
  filterTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2E7D32',
  },
  filterButtonText: {
    color: '#333333',
    fontWeight: '500',
  },
  filterButtonActiveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  leaderboardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  refreshButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  entryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  entryContainerHighlighted: {
    backgroundColor: '#E8F5E9',
  },
  entryRank: {
    width: 36,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555555',
    textAlign: 'center',
  },
  entryRankHighlighted: {
    color: '#2E7D32',
  },
  entryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryName: {
    fontSize: 16,
    color: '#333333',
  },
  entryNameCurrent: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  entryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555555',
  },
  entryValueCurrent: {
    color: '#2E7D32',
  },
  motivationalContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  motivationalText: {
    fontSize: 16,
    color: '#2E7D32',
    textAlign: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  loadMoreButtonText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
