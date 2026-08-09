import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { AppButton } from './ui';

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
export default function Button({ title, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) {
  return (
    <AppButton
      label={title}
      onPress={onPress}
      variant={variant === 'outline' ? 'ghost' : variant}
      disabled={disabled}
      loading={loading}
      style={[{ width: '100%', marginVertical: 6 }, style]}
    />
  );
}
