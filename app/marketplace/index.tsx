import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppButton, Card, Content, Screen, Skeleton, StatePanel } from '@/components/ui';
import { MarketplaceHeader, ProductCard, ProductGrid } from '@/features/marketplace/components';
import { marketplaceService, type MarketplaceHome } from '@/features/marketplace';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useAppTheme } from '@/theme';
import analyticsService from '@/services/analyticsService';

const localDate = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; };

export default function MarketplaceScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const { locale, t } = useAppLocale();
  const [data, setData] = useState<MarketplaceHome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const compact = width < theme.breakpoints.tablet;
  const load = useCallback(async () => { setError(null); try { setData(await marketplaceService.getHome(locale, localDate())); } catch { setError(t('The marketplace could not load.', 'Пазарът не можа да се зареди.')); } }, [locale, t]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  useEffect(() => analyticsService.trackScreenView('Sustainability Marketplace'), []);
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <MarketplaceHeader />
    <Card elevated style={{ backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, padding: compact ? 22 : 32, marginBottom: 26, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', width: 280, height: 280, borderRadius: 140, right: -70, top: -120, backgroundColor: theme.colors.accent, opacity: .18 }} />
      <Text style={[theme.typography.label, { color: theme.colors.accent, letterSpacing: 1.1 }]}>{t('CONSCIOUS CHOICES, VERIFIED', 'ОСЪЗНАТИ И ПРОВЕРЕНИ ИЗБОРИ')}</Text>
      <Text style={[theme.typography.h1, { color: '#fff', marginTop: 7, maxWidth: 680 }]}>{t('Shop for what you need—not more than you need.', 'Купувайте необходимото — не повече от необходимото.')}</Text>
      <Text style={[theme.typography.body, { color: '#D8EAE0', marginTop: 9, maxWidth: 700 }]}>{t('Evidence-backed products from verified businesses, with transparent impact claims.', 'Продукти с доказателства от проверени бизнеси и прозрачни твърдения за въздействие.')}</Text>
      <View style={{ flexDirection: compact ? 'column' : 'row', gap: 10, marginTop: 20 }}><AppButton label={t('Search products', 'Търсене на продукти')} icon="search" variant="secondary" onPress={() => router.push('/marketplace/search' as any)} /><AppButton label={t('View orders', 'Моите поръчки')} icon="receipt-outline" variant="ghost" onPress={() => router.push('/marketplace/orders' as any)} style={{ borderColor: '#D8EAE0' }} /></View>
    </Card>
    {!data && !error ? <View style={{ gap: 12 }}><Skeleton height={230} /><Skeleton height={180} /></View> : null}
    {error ? <StatePanel icon="bag-outline" title={t('Marketplace unavailable', 'Пазарът не е достъпен')} message={error} action={<AppButton label={t('Try again', 'Опитайте отново')} onPress={() => void load()} />} /> : null}
    {data ? <>
      {data.dailyPick ? <><SectionTitle title={t("Today's Daily Pick", 'Днешният избор')} description={data.dailyPick.reasons[0]?.[locale] || t('A considered alternative for today.', 'Обмислена алтернатива за днес.')} /><View style={{ marginBottom: 30, alignItems: 'flex-start' }}><ProductCard product={data.dailyPick.product} reason={data.dailyPick.reasons[0]?.[locale]} /></View></> : null}
      <SectionTitle title={t('Browse by category', 'Разгледайте по категория')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 9, paddingBottom: 26 }}>{data.categories.map((category) => <AppButton key={category.id} label={category.name[locale]} variant="secondary" onPress={() => router.push({ pathname: '/marketplace/search' as any, params: { category: category.slug } })} />)}</ScrollView>
      {data.deals.length ? <><SectionTitle title={t('Exclusive deals', 'Ексклузивни оферти')} description={t('Server-verified prices for Green Compass members.', 'Проверени от сървъра цени за потребители на Green Compass.')} /><ProductGrid products={data.deals} /></> : null}
      <View style={{ height: 28 }} />
      <SectionTitle title={t('Trending now', 'Популярни сега')} description={t('Based on verified marketplace activity—not paid placement.', 'На база проверена активност, а не платено позициониране.')} /><ProductGrid products={data.trending} />
      {data.businessSpotlight ? <Card style={{ marginTop: 30, backgroundColor: theme.colors.accentSoft }}><Text style={[theme.typography.label,{color:theme.colors.primary}]}>{t('BUSINESS SPOTLIGHT','БИЗНЕС НА СЕДМИЦАТА')}</Text><Text style={[theme.typography.h2,{color:theme.colors.text,marginTop:6}]}>{data.businessSpotlight.name}</Text><Text style={[theme.typography.body,{color:theme.colors.textMuted,marginTop:6,marginBottom:16}]}>{data.businessSpotlight.summary[locale]}</Text><AppButton label={t('Read their story','Прочетете историята')} variant="secondary" onPress={() => router.push(`/marketplace/business/${data.businessSpotlight!.slug}` as any)} /></Card> : null}
    </> : null}
  </Content></ScrollView></Screen>;
}

function SectionTitle({ title, description }: { title: string; description?: string }) { const { theme } = useAppTheme(); return <View style={{ marginBottom: 14 }}><Text style={[theme.typography.h2,{color:theme.colors.text}]}>{title}</Text>{description ? <Text style={[theme.typography.bodySmall,{color:theme.colors.textMuted,marginTop:4}]}>{description}</Text> : null}</View>; }
