import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  showSpinnerWhenDisabled?: boolean;
}

interface Styles {
  button: ViewStyle;
  buttonText: TextStyle;
  primary: ViewStyle;
  primaryText: TextStyle;
  secondary: ViewStyle;
  secondaryText: TextStyle;
  outline: ViewStyle;
  outlineText: TextStyle;
  disabled: ViewStyle;
  disabledText: TextStyle;
  buttonWithIcon: ViewStyle;
  spinnerWithTextContainer: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  showSpinnerWhenDisabled = false
}) => {
  const getButtonStyle = () => {
    if (disabled) return [styles.button, styles.disabled, style];
    
    switch (variant) {
      case 'primary':
        return [styles.button, styles.primary, style];
      case 'secondary':
        return [styles.button, styles.secondary, style];
      case 'outline':
        return [styles.button, styles.outline, style];
      default:
        return [styles.button, styles.primary, style];
    }
  };

  const getTextStyle = () => {
    if (disabled) return [styles.buttonText, styles.disabledText, textStyle];
    
    switch (variant) {
      case 'primary':
        return [styles.buttonText, styles.primaryText, textStyle];
      case 'secondary':
        return [styles.buttonText, styles.secondaryText, textStyle];
      case 'outline':
        return [styles.buttonText, styles.outlineText, textStyle];
      default:
        return [styles.buttonText, styles.primaryText, textStyle];
    }
  };

  // Add debug logging for button press
  const handlePress = () => {
    console.log(`Button pressed: ${title}`);
    if (onPress) {
      onPress();
    }
  };

  const spinnerColor = variant === 'outline' ? '#2E7D32' : '#FFFFFF';
  
  return (
    <TouchableOpacity
      style={[getButtonStyle(), icon ? styles.buttonWithIcon : null]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={spinnerColor} 
        />
      ) : disabled && showSpinnerWhenDisabled ? (
        <View style={styles.spinnerWithTextContainer}>
          <ActivityIndicator 
            size="small" 
            color={spinnerColor} 
          />
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create<Styles>({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primary: {
    backgroundColor: '#2E7D32', // Green primary color
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondary: {
    backgroundColor: '#E8F5E9', // Light green background
  },
  secondaryText: {
    color: '#2E7D32', // Green text
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  outlineText: {
    color: '#2E7D32',
  },
  disabled: {
    backgroundColor: '#CCCCCC',
  },
  disabledText: {
    color: '#777777',
  },
  buttonWithIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  spinnerWithTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
});

export default Button;
