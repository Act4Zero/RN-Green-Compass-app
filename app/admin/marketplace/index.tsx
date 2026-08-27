import { useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';

import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { marketplaceAdminService } from '@/features/marketplace';
import { useAppTheme } from '@/theme';

type AdminQueue = Awaited<ReturnType<typeof marketplaceAdminService.getQueue>>;

export default function MarketplaceAdminScreen() {
  const { theme } = useAppTheme();
  const [data, setData] = useState<AdminQueue | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await marketplaceAdminService.getQueue());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const action = async (run: () => Promise<void>) => {
    try {
      await run();
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    }
  };

  const onboard = async (businessId: string) => {
    try {
      const result = await marketplaceAdminService.createPartnerOnboarding(businessId);
      if (Platform.OS === 'web') window.location.assign(result.onboardingUrl);
      else await WebBrowser.openBrowserAsync(result.onboardingUrl);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    }
  };

  return (
    <Screen>
      <ScrollView>
        <Content wide>
          <PageHeader
            eyebrow="Marketplace operations"
            title="Review and fulfillment"
            description="Curated partner, product, review, return and order queues."
          />
          {!data && !error ? <Skeleton height={360} /> : null}
          {error ? (
            <StatePanel
              title="Admin queue unavailable"
              message={error}
              action={<AppButton label="Try again" onPress={() => void load()} />}
            />
          ) : null}
          {data ? (
            <View style={{ gap: 18 }}>
              <Queue title="Businesses" empty="No businesses await verification.">
                {data.businesses.map((row) => (
                  <QueueItem key={row.id} title={row.name} detail={row.verification_status}>
                    <AppButton
                      label="Verify"
                      onPress={() => void action(() => marketplaceAdminService.setBusinessStatus(row.id, 'verified'))}
                    />
                    <AppButton label="Stripe onboarding" variant="secondary" onPress={() => void onboard(row.id)} />
                    <AppButton
                      label="Reject"
                      variant="danger"
                      onPress={() => void action(() => marketplaceAdminService.setBusinessStatus(row.id, 'rejected'))}
                    />
                  </QueueItem>
                ))}
              </Queue>

              <Queue title="Products" empty="No products await review.">
                {data.products.map((row) => (
                  <QueueItem
                    key={row.id}
                    title={row.name_en}
                    detail={`${row.marketplace_businesses?.name || ''} · ${row.status} · stock ${row.stock_quantity}`}
                  >
                    <AppButton
                      label="Publish"
                      onPress={() => void action(() => marketplaceAdminService.setProductStatus(row.id, 'published'))}
                    />
                    <AppButton
                      label="Keep in review"
                      variant="secondary"
                      onPress={() => void action(() => marketplaceAdminService.setProductStatus(row.id, 'in_review'))}
                    />
                  </QueueItem>
                ))}
              </Queue>

              <Queue title="Reviews" empty="No reviews await moderation.">
                {data.reviews.map((row) => (
                  <QueueItem
                    key={row.id}
                    title={row.marketplace_products?.name_en || 'Product review'}
                    detail={`${row.rating}/5 · ${row.body}`}
                  >
                    <AppButton
                      label="Approve"
                      onPress={() => void action(() => marketplaceAdminService.moderateReview(row.id, 'approved'))}
                    />
                    <AppButton
                      label="Reject"
                      variant="danger"
                      onPress={() => void action(() => marketplaceAdminService.moderateReview(row.id, 'rejected'))}
                    />
                  </QueueItem>
                ))}
              </Queue>

              <Queue title="Orders" empty="No orders require fulfillment.">
                {data.orders.map((row) => (
                  <QueueItem
                    key={row.id}
                    title={row.order_number}
                    detail={`${row.marketplace_businesses?.name || ''} · ${row.status}`}
                  >
                    <AppButton
                      label="Processing"
                      variant="secondary"
                      onPress={() => void action(() => marketplaceAdminService.updateOrder(row.id, 'processing'))}
                    />
                    <AppButton
                      label="Delivered"
                      onPress={() => void action(() => marketplaceAdminService.updateOrder(row.id, 'delivered'))}
                    />
                  </QueueItem>
                ))}
              </Queue>

              <Queue title="Returns" empty="No active return requests.">
                {data.returns.map((row) => (
                  <QueueItem
                    key={row.id}
                    title={row.marketplace_orders?.order_number || 'Return'}
                    detail={`${row.reason} · ${row.status}`}
                  >
                    <AppButton
                      label="Refund"
                      onPress={() => void action(() => marketplaceAdminService.decideReturn(row.id, 'refund'))}
                    />
                    <AppButton
                      label="Reject"
                      variant="danger"
                      onPress={() => void action(() => marketplaceAdminService.decideReturn(row.id, 'reject'))}
                    />
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>
                      Refunds are executed server-side on the partner's Stripe account.
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
