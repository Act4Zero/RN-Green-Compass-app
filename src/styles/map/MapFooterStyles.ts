import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface MapFooterStyles {
  container: ViewStyle;
  contentRow: ViewStyle;
  separator: ViewStyle;
  linkText: TextStyle;
  errorText: TextStyle;
}

export const mapFooterStyles = StyleSheet.create<MapFooterStyles>({
  container: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 16,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 12,
  },
  linkText: {
    fontSize: 12,
    color: '#555555',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 8,
  },
});
