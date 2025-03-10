import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  autoComplete?: 'email' | 'password' | 'off' | 'name';
  isPassword?: boolean;
  showPasswordStrength?: boolean;
}

interface Styles {
  container: ViewStyle;
  label: TextStyle;
  input: ViewStyle;
  inputText: TextStyle;
  errorText: TextStyle;
  passwordContainer: ViewStyle;
  passwordToggle: ViewStyle;
  passwordStrengthContainer: ViewStyle;
  passwordStrengthBar: ViewStyle;
  passwordStrengthWeak: ViewStyle;
  passwordStrengthMedium: ViewStyle;
  passwordStrengthStrong: ViewStyle;
  passwordStrengthText: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  style,
  inputStyle,
  onBlur,
  autoComplete = 'off',
  isPassword = false,
  showPasswordStrength = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const getPasswordStrength = (password: string): { strength: number; label: string } => {
    if (!password) return { strength: 0, label: '' };

    // Basic password strength calculation
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    let label = '';
    if (strength <= 2) label = 'Weak';
    else if (strength <= 4) label = 'Medium';
    else label = 'Strong';

    return { strength: Math.min(strength, 5), label };
  };

  const passwordStrength = isPassword ? getPasswordStrength(value) : { strength: 0, label: '' };

  const getPasswordStrengthBarStyle = () => {
    const width = `${(passwordStrength.strength / 5) * 100}%`;
    let barStyle = { width };
    
    if (passwordStrength.label === 'Weak') {
      return [barStyle, styles.passwordStrengthWeak];
    } else if (passwordStrength.label === 'Medium') {
      return [barStyle, styles.passwordStrengthMedium];
    } else if (passwordStrength.label === 'Strong') {
      return [barStyle, styles.passwordStrengthStrong];
    }
    
    return barStyle;
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      {isPassword ? (
        <View style={styles.passwordContainer}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            secureTextEntry={!showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            style={[styles.input, styles.inputText, inputStyle, { flex: 1 }]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoComplete={autoComplete}
          />
          <TouchableOpacity 
            style={styles.passwordToggle} 
            onPress={togglePasswordVisibility}
          >
            <Ionicons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={24} 
              color="#757575" 
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[styles.input, styles.inputText, inputStyle]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete={autoComplete}
        />
      )}
      
      {isPassword && showPasswordStrength && value.length > 0 && (
        <View style={styles.passwordStrengthContainer}>
          <View style={styles.passwordStrengthBar}>
            <View style={getPasswordStrengthBarStyle()} />
          </View>
          <Text style={styles.passwordStrengthText}>
            {passwordStrength.label && `Password strength: ${passwordStrength.label}`}
          </Text>
        </View>
      )}
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  inputText: {
    fontSize: 16,
    color: '#333333',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  passwordToggle: {
    padding: 10,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthWeak: {
    backgroundColor: '#F44336',
    height: '100%',
  },
  passwordStrengthMedium: {
    backgroundColor: '#FFC107',
    height: '100%',
  },
  passwordStrengthStrong: {
    backgroundColor: '#4CAF50',
    height: '100%',
  },
  passwordStrengthText: {
    fontSize: 12,
    marginTop: 4,
    color: '#757575',
  },
});

export default Input;
