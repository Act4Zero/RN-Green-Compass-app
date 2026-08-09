import { Platform, TextStyle, ViewStyle } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export function resolveTheme(preference: ThemePreference, systemTheme: string | null | undefined): ResolvedTheme {
  if (preference === 'system') return systemTheme === 'dark' ? 'dark' : 'light';
  return preference;
}

export interface ThemeColors {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceMuted: string;
  surfaceStrong: string;
  primary: string;
  primaryHover: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  text: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderStrong: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  overlay: string;
}

export interface AppTheme {
  mode: ResolvedTheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
  breakpoints: typeof breakpoints;
}

export const lightColors: ThemeColors = {
  background: '#F3F6F0',
  backgroundElevated: '#F8FAF6',
  surface: '#FFFFFF',
  surfaceMuted: '#E8EFE6',
  surfaceStrong: '#DDE8DE',
  primary: '#174C35',
  primaryHover: '#0E3A28',
  primarySoft: '#DCEDE2',
  accent: '#B8E36B',
  accentSoft: '#ECF7D5',
  text: '#14251C',
  textMuted: '#5B6B61',
  textInverse: '#FFFFFF',
  border: '#D5E0D6',
  borderStrong: '#B9C9BC',
  success: '#1E7650',
  warning: '#A35F12',
  danger: '#B43E3E',
  info: '#296B87',
  overlay: 'rgba(8, 24, 16, 0.58)',
};

export const darkColors: ThemeColors = {
  background: '#0B1711',
  backgroundElevated: '#0E1D15',
  surface: '#13261B',
  surfaceMuted: '#193326',
  surfaceStrong: '#214332',
  primary: '#76D49B',
  primaryHover: '#94E2AF',
  primarySoft: '#173D2A',
  accent: '#C6F177',
  accentSoft: '#29431F',
  text: '#F2F7F3',
  textMuted: '#A8B8AD',
  textInverse: '#0B1711',
  border: '#2A4536',
  borderStrong: '#3B5B49',
  success: '#79D8A1',
  warning: '#F0B15D',
  danger: '#F08B87',
  info: '#83CBE4',
  overlay: 'rgba(2, 8, 5, 0.76)',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  display: { fontFamily: 'Manrope_700Bold', fontSize: 42, lineHeight: 48, fontWeight: '700' } as TextStyle,
  h1: { fontFamily: 'Manrope_700Bold', fontSize: 32, lineHeight: 39, fontWeight: '700' } as TextStyle,
  h2: { fontFamily: 'Manrope_700Bold', fontSize: 24, lineHeight: 31, fontWeight: '700' } as TextStyle,
  h3: { fontFamily: 'Manrope_600SemiBold', fontSize: 18, lineHeight: 25, fontWeight: '600' } as TextStyle,
  body: { fontFamily: 'Manrope_400Regular', fontSize: 16, lineHeight: 24, fontWeight: '400' } as TextStyle,
  bodySmall: { fontFamily: 'Manrope_400Regular', fontSize: 14, lineHeight: 21, fontWeight: '400' } as TextStyle,
  label: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.2 } as TextStyle,
  metric: { fontFamily: 'SpaceMono', fontSize: 28, lineHeight: 36, fontWeight: '700' } as TextStyle,
} as const;

export const shadows = {
  subtle: Platform.select<ViewStyle>({
    web: { boxShadow: '0 8px 28px rgba(19, 49, 32, 0.07)' } as ViewStyle,
    default: {
      shadowColor: '#081810',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 2,
    },
  })!,
  raised: Platform.select<ViewStyle>({
    web: { boxShadow: '0 16px 44px rgba(10, 35, 21, 0.13)' } as ViewStyle,
    default: {
      shadowColor: '#081810',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.14,
      shadowRadius: 20,
      elevation: 5,
    },
  })!,
} as const;

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export function createTheme(mode: ResolvedTheme): AppTheme {
  return {
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    spacing,
    radii,
    typography,
    shadows,
    breakpoints,
  };
}
