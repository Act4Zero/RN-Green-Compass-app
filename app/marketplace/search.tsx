import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AppButton, AppInput, Card, Content, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAppLocale } from '@/context/AppLocaleContext';
import { marketplaceService, type MarketplaceCategory, type MarketplaceProductSummary } from '@/features/marketplace';
import { MarketplaceHeader, ProductGrid } from '@/features/marketplace/components';
import { useAppTheme } from '@/theme';

type FilterOptions = {
  categories: MarketplaceCategory[];
  certifications: { slug: string; name: string; issuer: string }[];
};

const toCents = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : undefined;
};

const toggle = (values: string[], value: string) => values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];

export default function MarketplaceSearchScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'recommended' | 'popular' | 'price_asc' | 'price_desc'>('recommended');
  const [categorySlugs, setCategorySlugs] = useState<string[]>(params.category ? [params.category] : []);
  const [certificationSlugs, setCertificationSlugs] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [dealsOnly, setDealsOnly] = useState(false);
  const [options, setOptions] = useState<FilterOptions>({ categories: [], certifications: [] });
  const [products, setProducts] = useState<MarketplaceProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.category) setCategorySlugs((current) => current.includes(params.category!) ? current : [...current, params.category!]);
  }, [params.category]);

  useEffect(() => {
    marketplaceService.getFilterOptions().then(setOptions).catch(() => undefined);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await marketplaceService.search({
        query,
        categorySlugs,
        certificationSlugs,
        minPriceCents: toCents(minPrice),
        maxPriceCents: toCents(maxPrice),
        dealsOnly,
        sort,
      });
      setProducts(result.products);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t('Search failed.', 'Търсенето не бе успешно.'));
    } finally {
      setLoading(false);
    }
  }, [categorySlugs, certificationSlugs, dealsOnly, maxPrice, minPrice, query, sort, t]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 300);
    return () => clearTimeout(timeout);
  }, [load]);

  const clearFilters = () => {
    setCategorySlugs([]);
    setCertificationSlugs([]);
    setMinPrice('');
    setMaxPrice('');
    setDealsOnly(false);
  };

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Content wide>
          <MarketplaceHeader showBack />
          <Text style={[theme.typography.h1, { color: theme.colors.text, marginBottom: 16 }]}>{t('Find a better alternative', 'Намерете по-добра алтернатива')}</Text>
          <AppInput
            label={t('Search products and businesses', 'Търсене на продукти и бизнеси')}
            value={query}
            onChangeText={setQuery}
            placeholder={t('Reusable bottle, toothbrush…', 'Бутилка, четка за зъби…')}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 14 }}>
            {(['recommended', 'popular', 'price_asc', 'price_desc'] as const).map((value) => (
              <AppButton
                key={value}
                label={{ recommended: t('Recommended', 'Препоръчани'), popular: t('Popular', 'Популярни'), price_asc: t('Lowest price', 'Ниска цена'), price_desc: t('Highest price', 'Висока цена') }[value]}
                variant={sort === value ? 'primary' : 'secondary'}
                onPress={() => setSort(value)}
              />
            ))}
          </ScrollView>

          <Card style={{ marginBottom: 20, gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Filters', 'Филтри')}</Text>
              <AppButton label={t('Clear', 'Изчисти')} variant="ghost" onPress={clearFilters} />
            </View>

            {options.categories.length ? (
              <View>
                <Text style={[theme.typography.label, { color: theme.colors.textMuted, marginBottom: 8 }]}>{t('Categories', 'Категории')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {options.categories.map((category) => (
                    <AppButton
                      key={category.id}
                      label={category.name[locale]}
                      variant={categorySlugs.includes(category.slug) ? 'primary' : 'secondary'}
                      onPress={() => setCategorySlugs((current) => toggle(current, category.slug))}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {options.certifications.length ? (
              <View>
                <Text style={[theme.typography.label, { color: theme.colors.textMuted, marginBottom: 8 }]}>{t('Certifications', 'Сертификати')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {options.certifications.map((certification) => (
                    <AppButton
                      key={certification.slug}
                      label={certification.name}
                      variant={certificationSlugs.includes(certification.slug) ? 'primary' : 'secondary'}
                      onPress={() => setCertificationSlugs((current) => toggle(current, certification.slug))}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <View style={{ flex: 1, minWidth: 150 }}>
                <AppInput label={t('Minimum price (€)', 'Минимална цена (€)')} value={minPrice} onChangeText={setMinPrice} keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1, minWidth: 150 }}>
                <AppInput label={t('Maximum price (€)', 'Максимална цена (€)')} value={maxPrice} onChangeText={setMaxPrice} keyboardType="decimal-pad" />
              </View>
            </View>
            <View style={{ alignItems: 'flex-start' }}>
              <AppButton label={t('Exclusive deals only', 'Само ексклузивни оферти')} variant={dealsOnly ? 'primary' : 'secondary'} onPress={() => setDealsOnly((value) => !value)} />
            </View>
          </Card>

          {loading ? <View style={{ gap: 12 }}><Skeleton height={210} /><Skeleton height={210} /></View> : null}
          {error ? <StatePanel title={t('Search unavailable', 'Търсенето не е достъпно')} message={error} action={<AppButton label={t('Try again', 'Опитайте отново')} onPress={() => void load()} />} /> : null}
          {!loading && !error && !products.length ? <StatePanel icon="search-outline" title={t('No matching products', 'Няма съответстващи продукти')} message={t('Try a broader term or remove a filter.', 'Опитайте по-обща дума или премахнете филтър.')} /> : null}
          {!loading && !error ? <ProductGrid products={products} /> : null}
        </Content>
      </ScrollView>
    </Screen>
  );
}
