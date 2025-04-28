import { ViewStyle, TextStyle, StyleSheet } from 'react-native';

export interface HistoryStyles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  statsContainer: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  section: ViewStyle;
  sectionHeader: ViewStyle;
  sectionTitle: TextStyle;
  actionCountBadge: ViewStyle;
  actionCountText: TextStyle;
  filtersContainer: ViewStyle;
  filterButton: ViewStyle;
  filterButtonActive: ViewStyle;
  filterText: TextStyle;
  filterTextActive: TextStyle;
  calendarContainer: ViewStyle;
  calendarHeader: ViewStyle;
  calendarHeaderText: TextStyle;
  calendarNavButton: ViewStyle;
  weekdayHeader: ViewStyle;
  weekdayItem: ViewStyle;
  weekdayText: TextStyle;
  calendarGrid: ViewStyle;
  calendarDay: ViewStyle;
  calendarDayText: TextStyle;
  calendarDayActive: ViewStyle;
  calendarDayActiveText: TextStyle;
  calendarDayDisabled: ViewStyle;
  calendarDayDisabledText: TextStyle;
  calendarDayLowActivity: ViewStyle;
  calendarDayMediumActivity: ViewStyle;
  calendarDayHighActivity: ViewStyle;
  logContainer: ViewStyle;
  logItem: ViewStyle;
  logHeader: ViewStyle;
  logDate: TextStyle;
  logTitle: TextStyle;
  logDescription: TextStyle;
  logDetails: ViewStyle;
  logQuantity: TextStyle;
  logCO2: TextStyle;
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
  completedGoalItem: ViewStyle;
  completedGoalHeader: ViewStyle;
  completedGoalTitle: TextStyle;
  completedGoalCategory: TextStyle;
  completedGoalProgress: ViewStyle;
  completedGoalProgressText: TextStyle;
}

export const historyStyles = StyleSheet.create<HistoryStyles>({
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  actionCountBadge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  actionCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  filterText: {
    fontSize: 14,
    color: '#333333',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  calendarHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  calendarNavButton: {
    padding: 8,
    borderRadius: 20,
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayItem: {
    width: '14.28%',
    alignItems: 'center',
    padding: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDayLowActivity: {
    backgroundColor: '#E8F5E9',
  },
  calendarDayMediumActivity: {
    backgroundColor: '#A5D6A7',
  },
  calendarDayHighActivity: {
    backgroundColor: '#4CAF50',
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 20,
    marginHorizontal: '0.5%',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  calendarDayActive: {
    backgroundColor: '#E8F5E9',
  },
  calendarDayActiveText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  calendarDayDisabled: {
    opacity: 0.5,
  },
  calendarDayDisabledText: {
    color: '#CCCCCC',
  },
  logContainer: {
    marginTop: 8,
  },
  logItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logDate: {
    fontSize: 14,
    color: '#555555',
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  logDescription: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  logDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  logQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  logCO2: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
  },
  completedGoalItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  completedGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedGoalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  completedGoalCategory: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
  },
  completedGoalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedGoalProgressText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default historyStyles;
