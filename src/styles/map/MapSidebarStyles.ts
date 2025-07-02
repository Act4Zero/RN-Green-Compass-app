import { ViewStyle, TextStyle, StyleSheet } from 'react-native';

export interface MapSidebarStyles {
  container: ViewStyle;
  wideContainer: ViewStyle;
  narrowContainer: ViewStyle;
  title: TextStyle;
  filterSection: ViewStyle;
  filterTitle: TextStyle;
  chipContainer: ViewStyle;
  categoryChip: ViewStyle;
  inactiveChip: ViewStyle;
  chipText: TextStyle;
  activeChipText: TextStyle;
  toggleAllButton: ViewStyle;
  toggleAllActive: ViewStyle;
  toggleAllInactive: ViewStyle;
  toggleAllActiveText: TextStyle;
  toggleAllInactiveText: TextStyle;
  legend: ViewStyle;
  legendTitle: TextStyle;
  legendItem: ViewStyle;
  legendIcon: ViewStyle;
  legendText: TextStyle;
}

export const mapSidebarStyles = StyleSheet.create<MapSidebarStyles>({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  wideContainer: {
    width: 250,
    minHeight: '100%' as any, // Using type assertion for DimensionValue
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  narrowContainer: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2E7D32', // Green color consistent with the app theme
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  inactiveChip: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  toggleAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  toggleAllActive: {
    backgroundColor: '#2E7D32',
  },
  toggleAllInactive: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleAllActiveText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  toggleAllInactiveText: {
    color: '#666666',
    fontWeight: '500',
  },
  legend: {
    marginTop: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333333',
  },
});
