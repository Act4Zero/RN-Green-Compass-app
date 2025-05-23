import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface Styles {
  shareButton: ViewStyle;
  shareButtonText: TextStyle;
  shareIcon: TextStyle;
  buttonRow: ViewStyle;
  disabledShareButton: ViewStyle;
  disabledShareIcon: TextStyle;
  disabledShareButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    marginLeft: 8,
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2E7D32',
    marginLeft: 4,
  },
  shareIcon: {
    color: '#2E7D32',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  disabledShareButton: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  disabledShareIcon: {
    color: '#9E9E9E',
  },
  disabledShareButtonText: {
    color: '#9E9E9E',
  }
});

export default styles;
