import { ViewStyle, TextStyle, StyleSheet } from 'react-native';

export interface MapScreenStyles {
  container: ViewStyle;
  content: ViewStyle;
  mapContainer: ViewStyle;
}

export const mapScreenStyles = StyleSheet.create<MapScreenStyles>({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    flexDirection: 'column', // Default to column, overridden in component for responsive design
  },
  mapContainer: {
    flex: 1,
    position: 'relative' as 'relative',
    minHeight: 400, // Ensure minimum height for mobile
  },
});
