import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';
import { formatMarketplacePrice } from '../validation';
import type { MarketplaceProductSummary } from '../types';

export function ProductCard({ product, reason }: { product: MarketplaceProductSummary; reason?: string }) {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();
  const name = product.name[locale];
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={name} onPress={() => router.push(`/marketplace/product/${product.slug}` as any)} style={({ pressed }) => ({ flex: 1, minWidth: 230, maxWidth: 380, opacity: pressed ? 0.82 : 1, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.lg, overflow: 'hidden' })}>
      {product.imageUrl ? <Image source={{ uri: product.imageUrl }} accessibilityLabel={product.imageAlt[locale]} style={{ width: '100%', height: 170, backgroundColor: theme.colors.surfaceMuted }} resizeMode="cover" /> : <View style={{ height: 170, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="leaf-outline" size={42} color={theme.colors.primary} /></View>}
      <View style={{ padding: 16, gap: 7 }}>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {product.business.verified ? <Text style={[theme.typography.label, { color: theme.colors.primary, fontSize: 11 }]}>{t('VERIFIED BUSINESS', 'ПРОВЕРЕН БИЗНЕС')}</Text> : null}
          {product.compareAtPriceCents ? <Text style={[theme.typography.label, { color: theme.colors.danger, fontSize: 11 }]}>{t('DEAL', 'ОФЕРТА')}</Text> : null}
        </View>
        <Text numberOfLines={2} style={[theme.typography.h3, { color: theme.colors.text }]}>{name}</Text>
        <Text numberOfLines={2} style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{product.summary[locale]}</Text>
        {reason ? <Text numberOfLines={2} style={[theme.typography.bodySmall, { color: theme.colors.primary }]}>{reason}</Text> : null}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
          <View><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{formatMarketplacePrice(product.priceCents, locale)}</Text>{product.compareAtPriceCents ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, textDecorationLine: 'line-through' }]}>{formatMarketplacePrice(product.compareAtPriceCents, locale)}</Text> : null}</View>
          <View style={{ alignItems: 'flex-end' }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{product.sustainabilityRating.toFixed(1)}/5</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 10 }]}>{t('Sustainability', 'Устойчивост')}</Text></View>
        </View>
      </View>
    </Pressable>
  );
}
