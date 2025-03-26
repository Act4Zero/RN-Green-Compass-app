import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface QuickActionsStyles {
  quickActionsContainer: ViewStyle;
  quickActionItem: ViewStyle;
  quickActionIcon: ViewStyle;
  quickActionText: TextStyle;
}

export const quickActionsStyles = StyleSheet.create<QuickActionsStyles>({
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  quickActionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flex: 1,
    minWidth: 90,
    marginHorizontal: 4,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
});

export default quickActionsStyles;
