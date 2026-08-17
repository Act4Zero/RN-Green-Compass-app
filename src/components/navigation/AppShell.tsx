import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme';
import { APP_NAV_ITEMS, AppNavItem, isNavItemActive } from './config';

export { APP_NAV_ITEMS, AppNavItem, isNavItemActive } from './config';

function NavItem({ item, compact = false }: { item: AppNavItem; compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useAppTheme();
  const active = isNavItemActive(pathname, item);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      onPress={() => router.replace(item.href)}
      style={({ pressed }) => ({
        minHeight: compact ? 54 : 48,
        minWidth: compact ? 56 : undefined,
        paddingHorizontal: compact ? theme.spacing.xs : theme.spacing.md,
        borderRadius: theme.radii.md,
        flexDirection: compact ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? 3 : theme.spacing.sm,
        backgroundColor: active ? theme.colors.primarySoft : pressed ? theme.colors.surfaceMuted : 'transparent',
      })}
    >
      <Ionicons name={active ? item.activeIcon : item.icon} size={compact ? 21 : 20} color={active ? theme.colors.primary : theme.colors.textMuted} />
      <Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted, fontSize: compact ? 10 : 13 }]}>{item.label}</Text>
    </Pressable>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useAppTheme();
  const [hasHydrated, setHasHydrated] = useState(false);
  const isPublic = pathname === '/' || pathname.startsWith('/auth');
  const desktop = hasHydrated && width >= theme.breakpoints.desktop;

  // Expo static rendering has no viewport. Match its mobile-first shell for the
  // initial client render, then promote to the desktop rail after hydration.
  useEffect(() => setHasHydrated(true), []);

  if (isPublic) return <>{children}</>;

  return (
    <View style={{ flex: 1, flexDirection: desktop ? 'row' : 'column', backgroundColor: theme.colors.background }}>
      {desktop ? (
        <View
          style={{
            width: 248,
            paddingTop: Math.max(insets.top, theme.spacing.lg),
            paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
            paddingHorizontal: theme.spacing.md,
            borderRightWidth: 1,
            borderRightColor: theme.colors.border,
            backgroundColor: theme.colors.backgroundElevated,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
            <Image source={require('../../../assets/images/GCLogo-no-bg.png')} style={{ width: 38, height: 38 }} resizeMode="contain" />
            <View>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Green Compass</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11 }]}>Every action counts</Text>
            </View>
          </View>
          <View style={{ gap: theme.spacing.xs }}>
            {APP_NAV_ITEMS.map((item) => <NavItem key={item.href} item={item} />)}
          </View>
          <View style={{ flex: 1 }} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${theme.mode === 'dark' ? 'light' : 'dark'} theme`}
            onPress={toggleTheme}
            style={{ minHeight: 48, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm }}
          >
            <Ionicons name={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={19} color={theme.colors.primary} />
            <Text style={[theme.typography.label, { color: theme.colors.text }]}>{theme.mode === 'dark' ? 'Light mode' : 'Dark mode'}</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={{ flex: 1, paddingBottom: desktop ? 0 : 72 + insets.bottom }}>{children}</View>
      {!desktop ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 68 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingHorizontal: theme.spacing.xs,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.backgroundElevated,
          }}
        >
          {APP_NAV_ITEMS.map((item) => <NavItem key={item.href} item={item} compact />)}
        </View>
      ) : null}
    </View>
  );
}
