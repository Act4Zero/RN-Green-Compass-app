import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';

import { AppButton, AppInput, Card, Content, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useAuth } from '@/context/AuthContext';
import { formatMarketplacePrice, marketplaceService, type MarketplaceOrder } from '@/features/marketplace';
import { MarketplaceHeader } from '@/features/marketplace/components';
import { useAppTheme } from '@/theme';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { locale, t } = useAppLocale();
  const { theme } = useAppTheme();
  const [order, setOrder] = useState<MarketplaceOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    try {
      setOrder(await marketplaceService.getOrder(id));
    } catch {
      setError(t('Order could not be loaded.', 'Поръчката не можа да бъде заредена.'));
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const requestReturn = async () => {
    if (!user) return;
    try {
      await marketplaceService.requestReturn(user.id, id, reason, details);
      setSubmitted(true);
      await load();
    } catch {
      setError(t('Return request could not be sent.', 'Заявката за връщане не можа да бъде изпратена.'));
    }
  };

  return (
    <Screen>
      <ScrollView>
        <Content>
          <MarketplaceHeader showBack />
          {!order && !error ? <Skeleton height={320} /> : null}
          {error ? <Text style={[theme.typography.body, { color: theme.colors.danger, marginBottom: 12 }]}>{error}</Text> : null}
          {!order && error ? <StatePanel title={t('Order unavailable', 'Поръчката не е достъпна')} message={error} /> : null}
          {order ? (
            <>
              <Text style={[theme.typography.label, { color: theme.colors.primary }]}>{order.orderNumber}</Text>
              <Text style={[theme.typography.h1, { color: theme.colors.text, marginTop: 5 }]}>{t('Order details', 'Детайли за поръчката')}</Text>
              <Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 6, marginBottom: 18 }]}>
                {order.business.name} · {locale === 'bg' ? ({ payment_pending: 'очаква плащане', paid: 'платена', processing: 'обработва се', shipped: 'изпратена', delivered: 'доставена', cancelled: 'отказана', refund_requested: 'поискано възстановяване', partially_refunded: 'частично възстановена', refunded: 'възстановена', disputed: 'оспорена' }[order.status]) : order.status.replace(/_/g, ' ')}
              </Text>

              {order.items.map((item) => (
                <Card key={item.id} style={{ marginBottom: 9 }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.product.name[locale]}</Text>
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>
                    {item.quantity} × {formatMarketplacePrice(item.unitPriceCents, locale)}
                  </Text>
                </Card>
              ))}

              <Card style={{ marginTop: 10 }}>
                <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{formatMarketplacePrice(order.totalCents, locale)}</Text>
                {order.trackingUrl ? (
                  <AppButton
                    label={t('Track shipment', 'Проследи доставката')}
                    icon="navigate-outline"
                    style={{ marginTop: 12 }}
                    onPress={() => void Linking.openURL(order.trackingUrl!)}
                  />
                ) : null}
              </Card>

              {order.impactClaims.length ? (
                <Card style={{ marginTop: 14 }}>
                  <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Estimated purchase impact', 'Прогнозен ефект от покупката')}</Text>
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 5, marginBottom: 12 }]}>
                    {t('Estimates use the published methodology and assumptions for each product.', 'Оценките използват публикуваните методология и допускания за всеки продукт.')}
                  </Text>
                  <View style={{ gap: 10 }}>
                    {order.impactClaims.map((claim) => (
                      <View key={claim.id}>
                        <Text style={[theme.typography.h3, { color: theme.colors.primary }]}>{claim.value} {claim.unit}</Text>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{claim.label[locale]}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              ) : null}

              {['shipped', 'delivered'].includes(order.status) ? (
                <Card style={{ marginTop: 14, gap: 12 }}>
                  <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Request a return', 'Заявка за връщане')}</Text>
                  {submitted ? (
                    <Text style={[theme.typography.body, { color: theme.colors.primary }]}>{t('Your request was submitted for review.', 'Заявката ви е изпратена за преглед.')}</Text>
                  ) : (
                    <>
                      <AppInput label={t('Reason', 'Причина')} value={reason} onChangeText={setReason} />
                      <AppInput label={t('Details', 'Подробности')} value={details} onChangeText={setDetails} multiline numberOfLines={4} />
                      <AppButton label={t('Submit request', 'Изпрати заявка')} onPress={() => void requestReturn()} />
                    </>
                  )}
                </Card>
              ) : null}
            </>
          ) : null}
        </Content>
      </ScrollView>
    </Screen>
  );
}
