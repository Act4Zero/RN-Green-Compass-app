import { ViewStyle, StyleSheet } from 'react-native';

export interface MapViewStyles {
  container: ViewStyle;
  webview: ViewStyle;
}

export const mapViewStyles = StyleSheet.create<MapViewStyles>({
  container: {
    flex: 1,
    position: 'relative' as 'relative',
  },
  webview: {
    flex: 1,
  },
});
