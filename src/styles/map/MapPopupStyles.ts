import { ViewStyle, TextStyle, StyleSheet, Platform } from 'react-native';

export interface MapPopupStyles {
  popupContainer: ViewStyle;
  popup: ViewStyle;
  closeButton: ViewStyle;
  header: ViewStyle;
  categoryIcon: ViewStyle;
  title: TextStyle;
  content: ViewStyle;
  infoRow: ViewStyle;
  infoIcon: TextStyle;
  infoText: TextStyle;
  // Description related styles
  descriptionContainer: ViewStyle;
  descriptionText: TextStyle;
  // Source related styles
  sourceContainer: ViewStyle;
  sourceText: TextStyle;
  // Navigation related styles
  navigationButton: ViewStyle;
  navigationText: TextStyle;
}

export const mapPopupStyles = StyleSheet.create<MapPopupStyles>({
  popupContainer: {
    position: 'absolute' as 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    zIndex: 100,
  },
  popup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: 16,
  },
  closeButton: {
    position: 'absolute' as 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  sourceContainer: {
    marginTop: 8,
  },
  sourceText: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 4,
  },
  navigationText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});
