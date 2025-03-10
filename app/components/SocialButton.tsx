import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle,
  TextStyle,
  StyleProp,
  View
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

type SocialProvider = 'google' | 'apple';

interface SocialButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

interface Styles {
  button: ViewStyle;
  buttonText: TextStyle;
  iconContainer: ViewStyle;
  buttonDisabled: ViewStyle;
  textDisabled: TextStyle;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  style,
  textStyle,
  disabled = false,
}) => {
  const getProviderIcon = () => {
    switch (provider) {
      case 'google':
        return <AntDesign name="google" size={20} color="#EA4335" />;
      case 'apple':
        return <AntDesign name="apple1" size={20} color="#000000" />;
      default:
        return null;
    }
  };

  const getProviderText = () => {
    switch (provider) {
      case 'google':
        return 'Continue with Google';
      case 'apple':
        return 'Continue with Apple';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button, 
        style, 
        disabled && styles.buttonDisabled
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.iconContainer}>
        {getProviderIcon()}
      </View>
      <Text style={[
        styles.buttonText, 
        textStyle,
        disabled && styles.textDisabled
      ]}>
        {getProviderText()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create<Styles>({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.7,
  },
  textDisabled: {
    color: '#9E9E9E',
  }
});

export default SocialButton;
