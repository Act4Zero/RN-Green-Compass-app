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
}

interface Styles {
  button: ViewStyle;
  buttonText: TextStyle;
  iconContainer: ViewStyle;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  style,
  textStyle,
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
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {getProviderIcon()}
      </View>
      <Text style={[styles.buttonText, textStyle]}>
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
  }
});

export default SocialButton;
