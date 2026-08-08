import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/theme';

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useAppTheme();
  return (
    <View style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}>
      {children}
    </View>
  );
}
export function Content({ children, style, wide = false }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; wide?: boolean }) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        {
          width: '100%',
          maxWidth: wide ? 1280 : 1040,
          alignSelf: 'center',
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.xl,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Card({ children, style, elevated = false }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; elevated?: boolean }) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.lg,
        },
        elevated && theme.shadows.subtle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface AppButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({ label, icon, variant = 'primary', loading, disabled, style, ...props }: AppButtonProps) {
  const { theme } = useAppTheme();
  const palette = {
    primary: { background: theme.colors.primary, foreground: theme.colors.textInverse, border: theme.colors.primary },
    secondary: { background: theme.colors.primarySoft, foreground: theme.colors.primary, border: theme.colors.borderStrong },
    ghost: { background: 'transparent', foreground: theme.colors.text, border: theme.colors.border },
    danger: { background: theme.colors.danger, foreground: '#FFFFFF', border: theme.colors.danger },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          minHeight: 48,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          borderColor: palette.border,
          backgroundColor: palette.background,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.xs,
          opacity: disabled ? 0.5 : pressed ? 0.82 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.foreground} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={19} color={palette.foreground} /> : null}
          <Text style={[theme.typography.label, { color: palette.foreground }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function AppInput({ label, error, style, ...props }: TextInputProps & { label: string; error?: string; style?: StyleProp<TextStyle> }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text style={[theme.typography.label, { color: theme.colors.text }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          theme.typography.body,
          {
            minHeight: 50,
            borderWidth: 1,
            borderColor: error ? theme.colors.danger : theme.colors.borderStrong,
            borderRadius: theme.radii.md,
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: theme.spacing.md,
          },
          style,
        ]}
        {...props}
      />
      {error ? <Text style={[theme.typography.bodySmall, { color: theme.colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.lg, marginBottom: theme.spacing.xl }}>
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        {eyebrow ? <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: 1.2 }]}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={[theme.typography.h1, { color: theme.colors.text }]}>{title}</Text>
        {description ? <Text style={[theme.typography.body, { color: theme.colors.textMuted, maxWidth: 680 }]}>{description}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function StatePanel({ icon = 'leaf-outline', title, message, action }: { icon?: keyof typeof Ionicons.glyphMap; title: string; message: string; action?: React.ReactNode }) {
  const { theme } = useAppTheme();
  return (
    <Card style={{ alignItems: 'center', paddingVertical: theme.spacing.xxl, gap: theme.spacing.sm }}>
      <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={25} color={theme.colors.primary} />
      </View>
      <Text style={[theme.typography.h3, { color: theme.colors.text, textAlign: 'center' }]}>{title}</Text>
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, textAlign: 'center', maxWidth: 420 }]}>{message}</Text>
      {action}
    </Card>
  );
}

export function Skeleton({ width = '100%', height = 18, style }: { width?: ViewStyle['width']; height?: number; style?: StyleProp<ViewStyle> }) {
  const { theme } = useAppTheme();
  return <View accessibilityLabel="Loading" style={[{ width, height, borderRadius: theme.radii.sm, backgroundColor: theme.colors.surfaceStrong }, style]} />;
}

export function SegmentedControl<T extends string>({ value, options, onChange }: { value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', padding: 4, borderRadius: theme.radii.md, backgroundColor: theme.colors.surfaceMuted, gap: 4 }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={{ minHeight: 40, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radii.sm, backgroundColor: active ? theme.colors.surface : 'transparent' }}
          >
            <Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
