import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface GoalCardStyles {
  goalCard: ViewStyle;
  goalCardHeader: ViewStyle;
  goalTitle: TextStyle;
  goalCategory: TextStyle;
  goalProgress: ViewStyle;
  goalProgressBar: ViewStyle;
  goalProgressFill: ViewStyle;
  goalProgressText: TextStyle;
  goalActions: ViewStyle;
  goalActionButton: ViewStyle;
  goalActionText: TextStyle;
  timeChip: ViewStyle;
  timeChipText: TextStyle;
}

export const goalCardStyles = StyleSheet.create<GoalCardStyles>({
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: 250,
    minWidth: 200,
    marginRight: 12,
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalCardHeader: {
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  goalCategory: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  goalProgress: {
    marginBottom: 16,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 4,
  },
  goalProgressText: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'right',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  goalActionButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  goalActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2E7D32',
  },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#E8F5E9',
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
});

export default goalCardStyles;
