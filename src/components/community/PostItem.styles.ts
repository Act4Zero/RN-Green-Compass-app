import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface Styles {
  shareButton: ViewStyle;
  shareText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 16,
  },
  shareText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#757575',
  }
});

export default styles;
