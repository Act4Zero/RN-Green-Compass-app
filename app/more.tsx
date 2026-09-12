import React from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppButton, Content, PageHeader, Screen } from '@/components/ui';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useAppTheme } from '@/theme';

export default function MoreScreen() {
  const router = useRouter();
  const { t, locale, setLocale } = useAppLocale();
  const { theme, toggleTheme } = useAppTheme();
  const { width } = useWindowDimensions();
  const items = [
    { title: t('Knowledge', 'Знания'), description: t('Feed your curiosity with a short lesson.', 'Нахрани любопитството си с кратък урок.'), emoji: '💡', route: '/knowledge' },
    { title: t('Community', 'Общност'), description: t('Find people, ideas and shared missions.', 'Намери хора, идеи и общи мисии.'), emoji: '🙌', route: '/community' },
    { title: t('My green world', 'Моят зелен свят'), description: t('See how your actions take root.', 'Виж как действията ти пускат корени.'), emoji: '🌳', route: '/ecosystem' },
    { title: t('My profile', 'Моят профил'), description: t('Your interests, achievements and settings.', 'Твоите интереси, постижения и настройки.'), emoji: '✨', route: '/profile' },
  ];
  return <Screen><ScrollView><Content>
    <PageHeader eyebrow={t('There is more to discover', 'Има още за откриване')} title={t('Follow your curiosity 🧭', 'Последвай любопитството 🧭')} description={t('Your next discovery is a tap away.', 'Следващото откритие е съвсем наблизо.')} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {items.map(item => <Pressable key={item.route} accessibilityRole="button" accessibilityLabel={item.title} onPress={() => router.push(item.route as any)} style={({ pressed }) => ({ flexBasis: width < 760 ? '46%' : '23%', flexGrow: 1, padding: 18, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface, gap: 12 })}>
        <View style={{ width: 50, height: 50, borderRadius: 17, backgroundColor: theme.colors.primarySoft, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 27 }}>{item.emoji}</Text></View>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.title}</Text>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 13 }]}>{item.description}</Text>
        <Ionicons name="arrow-forward" size={21} color={theme.colors.primary} />
      </Pressable>)}
    </View>
    <View style={{ marginTop: 26, padding: 18, borderRadius: 22, backgroundColor: theme.colors.surfaceMuted, gap: 12 }}>
      <Text style={[theme.typography.label, { color: theme.colors.text }]}>{t('Make it feel like you', 'Настрой го по свой вкус')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <AppButton label={theme.mode === 'dark' ? t('Light theme', 'Светла тема') : t('Dark theme', 'Тъмна тема')} icon={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'} variant="secondary" onPress={toggleTheme} />
        <AppButton label={locale === 'bg' ? 'English' : 'Български'} icon="language-outline" variant="ghost" onPress={() => void setLocale(locale === 'bg' ? 'en' : 'bg')} />
      </View>
    </View>
  </Content></ScrollView></Screen>;
}
