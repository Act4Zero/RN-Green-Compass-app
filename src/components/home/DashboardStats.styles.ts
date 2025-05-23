import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface Styles {
  shareButton: ViewStyle;
  titleContainer: ViewStyle;
  shareIcon: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  shareButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shareIcon: {
    color: '#2E7D32',
  },
});

export default styles;
