import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface Styles {
  button: ViewStyle;
  buttonContent: ViewStyle;
  buttonText: TextStyle;
  primary: ViewStyle;
  outline: ViewStyle;
  ghost: ViewStyle;
  outlineText: TextStyle;
  ghostText: TextStyle;
  small: ViewStyle;
  medium: ViewStyle;
  large: ViewStyle;
  smallText: TextStyle;
  mediumText: TextStyle;
  largeText: TextStyle;
  disabled: ViewStyle;
  disabledText: TextStyle;
  icon: TextStyle;
  smallIcon: TextStyle;
  mediumIcon: TextStyle;
  largeIcon: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '500',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  primary: {
    backgroundColor: '#4CAF50',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: '#4CAF50',
  },
  ghostText: {
    color: '#4CAF50',
  },
  small: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 70,
  },
  medium: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 100,
  },
  large: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 130,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  disabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
  },
  disabledText: {
    color: '#9E9E9E',
  },
  icon: {
    marginRight: 6,
  },
  smallIcon: {
    fontSize: 14,
  },
  mediumIcon: {
    fontSize: 16,
  },
  largeIcon: {
    fontSize: 20,
  }
});

export default styles;
