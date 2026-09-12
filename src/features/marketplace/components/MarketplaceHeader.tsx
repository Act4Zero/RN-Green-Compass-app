import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

export function MarketplaceHeader({ showBack = false }: { showBack?: boolean }) {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  return (
    <View style={{ minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        {showBack ? <Pressable accessibilityLabel={t('Go back', 'Назад')} onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={22} color={theme.colors.text} /></Pressable> : null}
        <View><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: 1 }]}>{t('Thoughtful choices', 'Избори с грижа')}</Text><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Marketplace 🛍️', 'Магазин 🛍️')}</Text></View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>

        <Pressable accessibilityRole="link" accessibilityLabel={t('Wishlist', 'Любими')} onPress={() => router.push('/marketplace/wishlist' as any)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="heart-outline" size={22} color={theme.colors.primary} /></Pressable>
        <Pressable accessibilityRole="link" accessibilityLabel={t('Cart', 'Количка')} onPress={() => router.push('/marketplace/cart' as any)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="bag-outline" size={22} color={theme.colors.primary} /></Pressable>
      </View>
    </View>
  );
}
