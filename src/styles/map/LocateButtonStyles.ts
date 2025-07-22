import { StyleSheet, ViewStyle } from 'react-native';

export interface LocateButtonStyles {
  button: ViewStyle;
}

export const locateButtonStyles = StyleSheet.create<LocateButtonStyles>({
  button: {
    position: 'absolute' as 'absolute',
    right: 16,
    bottom: 80,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
});
