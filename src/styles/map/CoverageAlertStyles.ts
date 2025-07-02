import { ViewStyle, TextStyle, StyleSheet } from 'react-native';

export interface CoverageAlertStyles {
  container: ViewStyle;
  alertBox: ViewStyle;
  icon: ViewStyle;
  textContainer: ViewStyle;
  title: TextStyle;
  message: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
}

export const coverageAlertStyles = StyleSheet.create<CoverageAlertStyles>({
  container: {
    position: 'absolute' as 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  alertBox: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  icon: {
    marginBottom: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
