import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface HomeStyles {
  keyboardAvoidingContainer: ViewStyle;
  scrollView: ViewStyle;
  scrollContentContainer: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  welcomeText: TextStyle;
  userName: TextStyle;
  card: ViewStyle;
  cardTitle: TextStyle;
  cardContent: TextStyle;
  statsContainer: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  actionButton: ViewStyle;
  actionButtonText: TextStyle;
  headerButtons: ViewStyle;
  headerButton: ViewStyle;
  logoutButton: ViewStyle;
  section: ViewStyle;
  sectionHeader: ViewStyle;
  addGoalButton: ViewStyle;
  addGoalText: TextStyle;
  goalsContainer: ViewStyle;
  scrollViewStyle: ViewStyle;
  goalsRow: ViewStyle;
  emptyGoalsContainer: ViewStyle;
  emptyGoalsText: TextStyle;
  signOutButton: ViewStyle;
  signOutButtonText: TextStyle;
  mapNavButton: ViewStyle;
  mapNavButtonText: TextStyle;
}

export const homeStyles = StyleSheet.create<HomeStyles>({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flexGrow: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 700,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  mapNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    marginBottom: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  mapNavButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  welcomeText: {
    fontSize: 16,
    color: '#555555',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
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
  actionButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    marginLeft: 8,
  },
  logoutButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  addGoalText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2E7D32',
    marginLeft: 4,
  },
  goalsContainer: {
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    gap: 12,
    minWidth: '100%',
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  scrollViewStyle: {
    width: '100%',
    minHeight: 200,
    maxHeight: 250,
    flexGrow: 0,
    flexShrink: 0,
  },
  goalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emptyGoalsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginVertical: 10,
  },
  emptyGoalsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  signOutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  signOutButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default homeStyles;
