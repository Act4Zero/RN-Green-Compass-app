import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface MapMarkerStyles {
  markerContainer: ViewStyle;
  selectedMarkerContainer: ViewStyle;
  marker: ViewStyle;
  selectedNameTag: ViewStyle;
  nameText: TextStyle;
}

export const mapMarkerStyles = StyleSheet.create<MapMarkerStyles>({
  markerContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  selectedMarkerContainer: {
    zIndex: 2,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedNameTag: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
    maxWidth: 120,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
