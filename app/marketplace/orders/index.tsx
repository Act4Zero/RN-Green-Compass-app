import React, { useCallback, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppButton, Card, Content, Screen, Skeleton, StatePanel } from '@/components/ui';
import { MarketplaceHeader } from '@/features/marketplace/components';
import { formatMarketplacePrice, marketplaceService, type MarketplaceOrder } from '@/features/marketplace';
import { useAuth } from '@/context/AuthContext';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useAppTheme } from '@/theme';

const statusLabel = (status: MarketplaceOrder['status'], locale: 'en' | 'bg') => {
  if (locale !== 'bg') return status.replace(/_/g, ' ');
  const labels: Record<MarketplaceOrder['status'], string> = {
    payment_pending: 'очаква плащане',
    paid: 'платена',
    processing: 'обработва се',
    shipped: 'изпратена',
    delivered: 'доставена',
    cancelled: 'отказана',
    refund_requested: 'поискано възстановяване',
    partially_refunded: 'частично възстановена сума',
    refunded: 'с възстановена сума',
    disputed: 'оспорена',
  };
  return labels[status];
};

export default function OrdersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { locale, t } = useAppLocale();
  const { theme } = useAppTheme();
  const [orders, setOrders] = useState<MarketplaceOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!user) return;
    try {
      setOrders(await marketplaceService.listOrders());
    } catch {
      setError(t('Orders could not be loaded.', 'Поръчките не можаха да бъдат заредени.'));
    }
  }, [t, user]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return <Screen><ScrollView><Content><MarketplaceHeader showBack />
    {!user ? <StatePanel title={t('Sign in to view orders', 'Влезте, за да видите поръчките')} message={t('Order history is private.', 'Историята на поръчките е лична.')} /> : null}
    {user && !orders && !error ? <Skeleton height={260} /> : null}
    {error ? <StatePanel title={t('Orders unavailable', 'Поръчките не са достъпни')} message={error} /> : null}
    {orders && !orders.length ? <StatePanel icon="receipt-outline" title={t('No orders yet', 'Все още няма поръчки')} message={t('Your verified purchases will appear here.', 'Проверените ви покупки ще се показват тук.')} /> : null}
    {orders?.map((order) => <Card key={order.id} style={{ marginBottom: 10 }}>
      <Text style={[theme.typography.label, { color: theme.colors.primary }]}>{order.orderNumber} · {statusLabel(order.status, locale)}</Text>
      <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 5 }]}>{order.business.name}</Text>
      <Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 4 }]}>{formatMarketplacePrice(order.totalCents, locale)} · {new Date(order.createdAt).toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-GB')}</Text>
      <AppButton label={t('View order', 'Преглед на поръчката')} variant="ghost" onPress={() => router.push(`/marketplace/orders/${order.id}` as any)} style={{ marginTop: 12 }} />
    </Card>)}
  </Content></ScrollView></Screen>;
}
