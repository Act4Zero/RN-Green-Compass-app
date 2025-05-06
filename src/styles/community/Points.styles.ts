import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface PointsStyles {
  container: ViewStyle;
  header: ViewStyle;
  summaryContainer: ViewStyle;
  pointsCard: ViewStyle;
  pointsValue: TextStyle;
  pointsLabel: TextStyle;
  streakContainer: ViewStyle;
  streakValue: TextStyle;
  streakLabel: TextStyle;
  divider: ViewStyle;
  sectionTitle: TextStyle;
  historyContainer: ViewStyle;
  filterContainer: ViewStyle;
  filterScrollView: ViewStyle;
  filterChip: ViewStyle;
  filterChipActive: ViewStyle;
  filterChipText: TextStyle;
  filterChipTextActive: TextStyle;
  historyItem: ViewStyle;
  historyDate: TextStyle;
  historyList: ViewStyle;
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
  pointSourceIcon: ViewStyle;
  historyItemHeader: ViewStyle;
  historyItemContent: ViewStyle;
  pointsAmount: TextStyle;
  pointsDescription: TextStyle;
  historyItemDate: TextStyle;
}

export default StyleSheet.create<PointsStyles>({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  header: {
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryContainer: {
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
  pointsCard: {
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
  streakContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 16,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    flex: 1,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
  },
});
