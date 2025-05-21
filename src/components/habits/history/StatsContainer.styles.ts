import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface Styles {
  headerContainer: ViewStyle;
  shareButton: ViewStyle;
  shareIcon: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shareButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    color: '#2E7D32',
  },
});

export default styles;
