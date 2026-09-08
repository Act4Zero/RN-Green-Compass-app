import { useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';

import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAppLocale } from '@/context/AppLocaleContext';
import { marketplaceAdminService } from '@/features/marketplace';
import { useAppTheme } from '@/theme';

type AdminQueue = Awaited<ReturnType<typeof marketplaceAdminService.getQueue>>;

export default function MarketplaceAdminScreen() {
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();
  const [data, setData] = useState<AdminQueue | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await marketplaceAdminService.getQueue());
    } catch {
      setError(t('The administration queue could not be loaded.', 'Административната опашка не може да бъде заредена.'));
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const action = async (run: () => Promise<void>) => {
    try {
      await run();
      await load();
    } catch {
      setError(t('The action could not be completed.', 'Действието не можа да бъде изпълнено.'));
    }
  };

  const onboard = async (businessId: string) => {
    try {
      const result = await marketplaceAdminService.createPartnerOnboarding(businessId);
      if (Platform.OS === 'web') window.location.assign(result.onboardingUrl);
      else await WebBrowser.openBrowserAsync(result.onboardingUrl);
    } catch {
      setError(t('Partner onboarding could not be opened.', 'Регистрацията на партньора не можа да бъде отворена.'));
    }
  };

  return (
    <Screen>
      <ScrollView>
        <Content wide>
          <PageHeader
            eyebrow={t('Marketplace operations', 'Операции на пазара')}
            title={t('Review and fulfillment', 'Преглед и изпълнение')}
            description={t('Curated partner, product, review, return and order queues.', 'Опашки за партньори, продукти, отзиви, връщания и поръчки.')}
          />
          {!data && !error ? <Skeleton height={360} /> : null}
          {error ? (
            <StatePanel
              title={t('Admin queue unavailable', 'Административната опашка не е достъпна')}
              message={error}
              action={<AppButton label={t('Try again', 'Опитай отново')} onPress={() => void load()} />}
            />
          ) : null}
          {data ? (
            <View style={{ gap: 18 }}>
              <Queue title={t('Businesses', 'Бизнеси')} empty={t('No businesses await verification.', 'Няма бизнеси, които очакват проверка.')}>
                {data.businesses.map((row) => (
                  <QueueItem key={row.id} title={row.name} detail={row.verification_status}>
                    <AppButton
                      label={t('Verify', 'Потвърди')}
                      onPress={() => void action(() => marketplaceAdminService.setBusinessStatus(row.id, 'verified'))}
                    />
                    <AppButton label={t('Stripe onboarding', 'Регистрация в Stripe')} variant="secondary" onPress={() => void onboard(row.id)} />
                    <AppButton
                      label={t('Reject', 'Отхвърли')}
                      variant="danger"
                      onPress={() => void action(() => marketplaceAdminService.setBusinessStatus(row.id, 'rejected'))}
                    />
                  </QueueItem>
                ))}
              </Queue>

              <Queue title={t('Products', 'Продукти')} empty={t('No products await review.', 'Няма продукти, които очакват преглед.')}>
                {data.products.map((row) => (
                  <QueueItem
                    key={row.id}
                    title={locale === 'bg' ? row.name_bg : row.name_en}
                    detail={`${row.marketplace_businesses?.name || ''} · ${localizeStatus(row.status, locale)} · ${t('stock', 'наличност')} ${row.stock_quantity}`}
                  >
                    <AppButton
                      label={t('Publish', 'Публикувай')}
                      onPress={() => void action(() => marketplaceAdminService.setProductStatus(row.id, 'published'))}
                    />
                    <AppButton
                      label={t('Keep in review', 'Остави за преглед')}
                      variant="secondary"
                      onPress={() => void action(() => marketplaceAdminService.setProductStatus(row.id, 'in_review'))}
                    />
                  </QueueItem>
                ))}
              </Queue>

              <Queue title={t('Reviews', 'Отзиви')} empty={t('No reviews await moderation.', 'Няма отзиви, които очакват модерация.')}>
                {data.reviews.map((row) => (
                  <QueueItem
                    key={row.id}
                    title={(locale === 'bg' ? row.marketplace_products?.name_bg : row.marketplace_products?.name_en) || t('Product review', 'Отзив за продукт')}
                    detail={`${row.rating}/5 · ${row.body}`}
                  >
                    <AppButton
                      label={t('Approve', 'Одобри')}
                      onPress={() => void action(() => marketplaceAdminService.moderateReview(row.id, 'approved'))}
                    />
                    <AppButton
                      label={t('Reject', 'Отхвърли')}
                      variant="danger"
                      onPress={() => void action(() => marketplaceAdminService.moderateReview(row.id, 'rejected'))}
                    />
                  </QueueItem>
                ))}
              </Queue>

              <Queue title={t('Orders', 'Поръчки')} empty={t('No orders require fulfillment.', 'Няма поръчки, които изискват изпълнение.')}>
                {data.orders.map((row) => (
                  <QueueItem
                    key={row.id}
                    title={row.order_number}
                    detail={`${row.marketplace_businesses?.name || ''} · ${localizeStatus(row.status, locale)}`}
                  >
                    <AppButton
                      label={t('Processing', 'Обработва се')}
                      variant="secondary"
                      onPress={() => void action(() => marketplaceAdminService.updateOrder(row.id, 'processing'))}
                    />
                    <AppButton
                      label={t('Delivered', 'Доставена')}
                      onPress={() => void action(() => marketplaceAdminService.updateOrder(row.id, 'delivered'))}
                    />
                  </QueueItem>
                ))}
              </Queue>

              <Queue title={t('Returns', 'Връщания')} empty={t('No active return requests.', 'Няма активни заявки за връщане.')}>
                {data.returns.map((row) => (
                  <QueueItem
                    key={row.id}
                    title={row.marketplace_orders?.order_number || t('Return', 'Връщане')}
                    detail={`${row.reason} · ${localizeStatus(row.status, locale)}`}
                  >
                    <AppButton
                      label={t('Refund', 'Възстанови сумата')}
                      onPress={() => void action(() => marketplaceAdminService.decideReturn(row.id, 'refund'))}
                    />
                    <AppButton
                      label={t('Reject', 'Отхвърли')}
                      variant="danger"
                      onPress={() => void action(() => marketplaceAdminService.decideReturn(row.id, 'reject'))}
                    />
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>
                      {t("Refunds are executed server-side on the partner's Stripe account.", 'Сумите се възстановяват от сървъра чрез Stripe профила на партньора.')}
                    </Text>
                  </QueueItem>
                ))}
              </Queue>
            </View>
          ) : null}
        </Content>
      </ScrollView>
    </Screen>
  );
}

function localizeStatus(status: string, locale: 'en' | 'bg') {
  if (locale !== 'bg') return status.replaceAll('_', ' ');
  const labels: Record<string, string> = {
    pending: 'чака', verified: 'потвърден', rejected: 'отхвърлен', draft: 'чернова', in_review: 'в преглед',
    published: 'публикуван', approved: 'одобрен', processing: 'обработва се', delivered: 'доставена',
    refund_requested: 'поискано възстановяване', refunded: 'възстановена сума', closed: 'приключен',
  };
  return labels[status] || status.replaceAll('_', ' ');
}

function Queue({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const { theme } = useAppTheme();
  const hasChildren = React.Children.count(children) > 0;
  return (
    <View>
      <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 10 }]}>{title}</Text>
      {hasChildren ? (
        children
      ) : (
        <Card>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{empty}</Text>
        </Card>
      )}
    </View>
  );
}

function QueueItem({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  const { theme } = useAppTheme();
  return (
    <Card style={{ marginBottom: 9 }}>
      <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{detail}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>{children}</View>
    </Card>
  );
}
