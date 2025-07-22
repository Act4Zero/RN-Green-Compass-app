import { ViewStyle, TextStyle, StyleSheet } from 'react-native';

export interface MapSidebarStyles {
  container: ViewStyle;
  wideContainer: ViewStyle;
  narrowContainer: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  homeButton: ViewStyle;
  filterSection: ViewStyle;
  filterHeader: ViewStyle;
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
}

export const mapSidebarStyles = StyleSheet.create<MapSidebarStyles>({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  wideContainer: {
    width: 220,
    minHeight: '100%' as any, // Using type assertion for DimensionValue
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  narrowContainer: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32', // Green color consistent with the app theme
    flex: 1,
  },
  homeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F8F0',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  filterSection: {
    marginBottom: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  inactiveChip: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  toggleAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  toggleAllActive: {
    backgroundColor: '#2E7D32',
  },
  toggleAllInactive: {
    backgroundColor: '#F8F8F8',
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

});
