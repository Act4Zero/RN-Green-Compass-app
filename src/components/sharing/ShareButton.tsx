import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle, 
  View,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SocialPlatform } from '../../utils/shareUtils';

interface Styles {
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

export interface ShareButtonProps {
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'outline' | 'ghost';
  platformIcon?: SocialPlatform;
  label?: string;
  disabled?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/**
 * ShareButton component for triggering sharing actions
 */
export function ShareButton({
  onPress,
  size = 'medium',
  variant = 'primary',
  platformIcon,
  label = 'Share',
  disabled = false,
  isLoading = false,
  style,
  testID
}: ShareButtonProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Determine the icon name based on platform
  function getIconName(): string {
    switch (platformIcon) {
      case 'instagram':
        return 'logo-instagram';
      case 'twitter':
        return 'logo-twitter';
      case 'linkedin':
        return 'logo-linkedin';
      case 'general':
      default:
        return 'share-social-outline';
    }
  }

  // Get the appropriate styles for the current configuration
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    isDarkMode && variant === 'outline' && { borderColor: '#666' },
    isDarkMode && variant === 'ghost' && { backgroundColor: 'transparent' },
    style
  ];

  const textStyles = [
    styles.buttonText,
    styles[`${size}Text`],
    variant === 'outline' && styles.outlineText,
    variant === 'ghost' && styles.ghostText,
    disabled && styles.disabledText,
    isDarkMode && variant !== 'primary' && { color: '#EEE' }
  ];

  const iconStyles = [
    styles.icon,
    styles[`${size}Icon`],
    variant === 'outline' && { color: '#2E7D32' },
    variant === 'ghost' && { color: '#2E7D32' },
    disabled && { color: '#AAA' },
    isDarkMode && variant !== 'primary' && { color: '#EEE' }
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={buttonStyles}
      testID={testID}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' ? 'white' : '#2E7D32'} 
          />
        ) : (
          <>
            {platformIcon && (
              <Ionicons 
                name={getIconName()} 
                style={iconStyles} 
              />
            )}
            <Text style={textStyles}>{label}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
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
    fontWeight: '600',
    textAlign: 'center',
  },
  primary: {
    backgroundColor: '#2E7D32',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: '#2E7D32',
  },
  ghostText: {
    color: '#2E7D32',
  },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
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

export default ShareButton;
