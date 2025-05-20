import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  View,
  useColorScheme
} from 'react-native';
import styles, { Styles } from './ShareButton.styles';
import { Ionicons } from '@expo/vector-icons';
import { SocialPlatform } from '../../utils/shareUtils';



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

export default ShareButton;
