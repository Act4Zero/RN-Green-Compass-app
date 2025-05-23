import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface Styles {
  container: ViewStyle;
  messageWithButton: ViewStyle;
  shareButton: ViewStyle;
  shareIcon: TextStyle;
  shareButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  messageWithButton: {
    flex: 1,
    marginRight: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  shareIcon: {
    color: '#2E7D32',
    marginRight: 4,
  },
  shareButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  }
});

export default styles;
