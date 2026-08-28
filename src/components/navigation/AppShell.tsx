import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme';
import { APP_NAV_ITEMS, MOBILE_NAV_ITEMS, AppNavItem, isNavItemActive } from './config';
import { PROFILE_NAV_ITEM } from './config';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useAppLocale } from '@/context/AppLocaleContext';

export { APP_NAV_ITEMS, MOBILE_NAV_ITEMS, AppNavItem, isNavItemActive } from './config';

function NavItem({ item, compact = false }: { item: AppNavItem; compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useAppTheme();
  const { locale } = useAppLocale();
  const active = isNavItemActive(pathname, item);
  const label = locale === 'bg' ? item.labelBg : item.label;

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={() => router.replace(item.href as any)}
      style={({ pressed }) => ({
        minHeight: compact ? 54 : 48,
        minWidth: compact ? 56 : undefined,
        width: compact ? undefined : '100%',
        flex: compact ? 1 : undefined,
        paddingHorizontal: compact ? theme.spacing.xs : theme.spacing.md,
        borderRadius: theme.radii.md,
        flexDirection: compact ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: compact ? 'center' : 'flex-start',
        gap: compact ? 3 : 0,
        backgroundColor: active ? theme.colors.primarySoft : pressed ? theme.colors.surfaceMuted : 'transparent',
      })}
    >
      <View
        style={{
          width: compact ? 24 : 28,
          height: compact ? 22 : 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: compact ? 0 : theme.spacing.sm,
        }}
      >
        <Ionicons name={active ? item.activeIcon : item.icon} size={compact ? 21 : 20} color={active ? theme.colors.primary : theme.colors.textMuted} />
      </View>
      <Text
        numberOfLines={1}
        style={[
          theme.typography.label,
          {
            color: active ? theme.colors.primary : theme.colors.textMuted,
            fontSize: compact ? 10 : 13,
            textAlign: compact ? 'center' : 'left',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useAppTheme();
  const { locale, setLocale, t } = useAppLocale();
  const { user, loading: authLoading } = useAuth();
  const knowledgeEnabled = useFeatureFlag('knowledge_hub', true);
  // Marketplace is a primary destination. Backend flags may control commerce
  // operations, but they must not make the whole destination disappear.
  const marketplaceEnabled = true;
  const [hasHydrated, setHasHydrated] = useState(false);
  const isPublicKnowledge = pathname.startsWith('/knowledge') && !user && !authLoading;
  const isPublicMarketplace = pathname.startsWith('/marketplace') && !user && !authLoading;
  const isPublic = pathname === '/' || pathname.startsWith('/auth') || isPublicKnowledge || isPublicMarketplace;
  const desktop = hasHydrated && width >= theme.breakpoints.desktop;
  const filterEnabled = (items: AppNavItem[]) => items.filter((item) => (knowledgeEnabled || item.href !== '/knowledge') && (marketplaceEnabled || item.href !== '/marketplace'));
  const desktopNavItems = filterEnabled(APP_NAV_ITEMS);
  const mobileNavItems = filterEnabled(MOBILE_NAV_ITEMS);

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
            <Image source={require('../../../assets/images/GCLogo-rich-premium-original-shape.png')} style={{ width: 38, height: 38 }} resizeMode="contain" />
            <View>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Green Compass</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11 }]}>{t('Every action counts', 'Всяко действие има значение')}</Text>
            </View>
          </View>
          <View style={{ gap: theme.spacing.xs }}>
            {desktopNavItems.map((item) => <NavItem key={item.href} item={item} />)}
          </View>
          <View style={{ flex: 1 }} />
          <View style={{ marginBottom: theme.spacing.sm }}><NavItem item={PROFILE_NAV_ITEM} /></View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Switch language', 'Смени езика')}
            onPress={() => void setLocale(locale === 'en' ? 'bg' : 'en')}
            style={{ minHeight: 48, marginBottom: theme.spacing.sm, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm }}
          >
            <Ionicons name="language-outline" size={19} color={theme.colors.primary} />
            <Text style={[theme.typography.label, { color: theme.colors.text }]}>{locale === 'bg' ? 'English' : 'Български'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(`Switch to ${theme.mode === 'dark' ? 'light' : 'dark'} theme`, `Смени към ${theme.mode === 'dark' ? 'светла' : 'тъмна'} тема`)}
            onPress={toggleTheme}
            style={{ minHeight: 48, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm }}
          >
            <Ionicons name={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={19} color={theme.colors.primary} />
            <Text style={[theme.typography.label, { color: theme.colors.text }]}>{theme.mode === 'dark' ? t('Light mode', 'Светъл режим') : t('Dark mode', 'Тъмен режим')}</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={{ flex: 1, paddingBottom: desktop ? 0 : 72 + insets.bottom }}>{children}</View>
      {!desktop ? (
        <View style={{ position: 'absolute', right: theme.spacing.md, bottom: 80 + insets.bottom, zIndex: 20 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Switch language', 'Смени езика')}
          onPress={() => void setLocale(locale === 'en' ? 'bg' : 'en')}
          style={({ pressed }) => ({ width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.backgroundElevated, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.78 : 1, ...theme.shadows.subtle })}
        >
          <Text style={[theme.typography.label, { color: theme.colors.primary, fontSize: 11 }]}>{locale === 'en' ? 'BG' : 'EN'}</Text>
        </Pressable>
        </View>
      ) : null}
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
          {mobileNavItems.map((item) => <NavItem key={item.href} item={item} compact />)}
        </View>
      ) : null}
    </View>
  );
}
