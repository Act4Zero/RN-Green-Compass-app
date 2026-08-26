import { Slot } from 'expo-router';

import { Content, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useFeatureFlagsContext } from '@/context/FeatureFlagsContext';

export default function MarketplaceLayout() {
  const { flags, isLoading } = useFeatureFlagsContext();
  const { t } = useAppLocale();

  if (isLoading) {
    return (
      <Screen>
        <Content>
          <Skeleton height={320} />
        </Content>
      </Screen>
    );
  }

  if (!flags.sustainability_marketplace_mvp) {
    return (
      <Screen>
        <Content>
          <StatePanel
            icon="bag-handle-outline"
            title={t('Marketplace is coming soon', 'Marketplace очаквайте скоро')}
            message={t(
              'We are verifying the first partners and their sustainability evidence before opening the catalog.',
              'Проверяваме първите партньори и доказателствата им за устойчивост, преди да отворим каталога.',
            )}
          />
        </Content>
      </Screen>
    );
  }

  return <Slot />;
}
