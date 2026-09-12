import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppButton, Card, Content, Screen, Skeleton, StatePanel } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { SectionHero } from '@/components/ui/SectionHero';
import { MarketplaceHeader, ProductCard, ProductGrid } from '@/features/marketplace/components';
import { marketplaceService, type MarketplaceHome } from '@/features/marketplace';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useAppTheme } from '@/theme';
import analyticsService from '@/services/analyticsService';

const localDate = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; };

export default function MarketplaceScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();
  const [data, setData] = useState<MarketplaceHome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { setError(null); try { setData(await marketplaceService.getHome(locale, localDate())); } catch { setError(t('The marketplace could not load.', 'Пазарът не можа да се зареди.')); } }, [locale, t]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  useEffect(() => analyticsService.trackScreenView('Sustainability Marketplace'), []);
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <MarketplaceHeader />
    <SectionHero tone="peach" eyebrow={t('Thoughtful everyday essentials', 'Смислени избори за всеки ден')} title={t('Choose well. Use longer.', 'Избери с грижа. Използвай дълго.')} emoji="🛍️" description={t('Discover reusable alternatives and the people behind them. Read the evidence and choose what fits your life.', 'Открий алтернативи за многократна употреба и хората зад тях. Виж информацията и избери подходящото за теб.')} illustration={require('../../assets/images/knowledge/zero-waste.webp')} illustrationLabel={t('Illustration of reusable everyday essentials', 'Илюстрация на вещи за многократна употреба')}>
      <AppButton label={t('Find a product', 'Намери продукт')} icon="search" onPress={() => router.push('/marketplace/search' as any)} />
      <AppButton label={t('My orders', 'Моите поръчки')} icon="receipt-outline" variant="secondary" onPress={() => router.push('/marketplace/orders' as any)} />
    </SectionHero>
    {!data && !error ? <View style={{ gap: 12 }}><Skeleton height={230} /><Skeleton height={180} /></View> : null}
    {error ? <StatePanel icon="bag-outline" title={t('Marketplace unavailable', 'Пазарът не е достъпен')} message={error} action={<AppButton label={t('Try again', 'Опитайте отново')} onPress={() => void load()} />} /> : null}
    {data ? <>
      {data.dailyPick ? <><SectionTitle title={t("Today's Daily Pick", 'Днешният избор')} description={data.dailyPick.reasons[0]?.[locale] || t('A considered alternative for today.', 'Обмислена алтернатива за днес.')} /><View style={{ marginBottom: 30, alignItems: 'flex-start' }}><ProductCard product={data.dailyPick.product} reason={data.dailyPick.reasons[0]?.[locale]} /></View></> : null}
      <SectionTitle title={t('Browse by category', 'Какво търсиш?')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 26 }}>{data.categories.map((category, index) => <Pressable key={category.id} accessibilityRole="button" accessibilityLabel={category.name[locale]} onPress={() => router.push({ pathname: '/marketplace/search' as any, params: { category: category.slug } })} style={({ pressed }) => ({ width: 152, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface, gap: 12 })}>
        <View style={{ width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: index % 2 ? theme.colors.accentSoft : theme.colors.primarySoft }}><Ionicons name={category.icon as any} size={24} color={theme.colors.primary} /></View>
        <Text style={[theme.typography.label, { color: theme.colors.text }]}>{category.name[locale]}</Text>
      </Pressable>)}</ScrollView>
      {data.deals.length ? <><SectionTitle title={t('Exclusive deals', 'Ексклузивни оферти')} description={t('Server-verified prices for Green Compass members.', 'Предложения за общността на Green Compass.')} /><ProductGrid products={data.deals} /></> : null}
      <View style={{ height: 28 }} />
      <SectionTitle title={t('Trending now', 'Популярни сега')} description={t('Based on verified marketplace activity—not paid placement.', 'На база проверена активност, а не платено позициониране.')} /><ProductGrid products={data.trending} />
      {data.businessSpotlight ? <Card style={{ marginTop: 30, backgroundColor: theme.colors.accentSoft }}><Text style={[theme.typography.label,{color:theme.colors.primary}]}>{t('BUSINESS SPOTLIGHT','БИЗНЕС НА СЕДМИЦАТА')}</Text><Text style={[theme.typography.h2,{color:theme.colors.text,marginTop:6}]}>{data.businessSpotlight.name}</Text><Text style={[theme.typography.body,{color:theme.colors.textMuted,marginTop:6,marginBottom:16}]}>{data.businessSpotlight.summary[locale]}</Text><AppButton label={t('Read their story','Прочетете историята')} variant="secondary" onPress={() => router.push(`/marketplace/business/${data.businessSpotlight!.slug}` as any)} /></Card> : null}
    </> : null}
  </Content></ScrollView></Screen>;
}

function SectionTitle({ title, description }: { title: string; description?: string }) { const { theme } = useAppTheme(); return <View style={{ marginBottom: 14 }}><Text style={[theme.typography.h2,{color:theme.colors.text}]}>{title}</Text>{description ? <Text style={[theme.typography.bodySmall,{color:theme.colors.textMuted,marginTop:4}]}>{description}</Text> : null}</View>; }
