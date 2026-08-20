import { Asset } from 'expo-asset';
import { Linking } from 'react-native';
import type { KnowledgeLocale } from './types';

export const KNOWLEDGE_TOOLKITS = [
  { id: 'low-waste-home', title: { en: 'Low-Waste Home Toolkit', bg: 'Пакет за дом с по-малко отпадъци' }, audience: { en: 'Individuals and households', bg: 'Хора и домакинства' }, module: require('../../../output/pdf/low-waste-home-toolkit.pdf') },
  { id: 'home-energy', title: { en: 'Home Energy Check-up', bg: 'Домашна енергийна проверка' }, audience: { en: 'Households and community advisers', bg: 'Домакинства и общностни съветници' }, module: require('../../../output/pdf/home-energy-checkup.pdf') },
  { id: 'food-planner', title: { en: 'Sustainable Food Planner', bg: 'Планер за устойчива храна' }, audience: { en: 'Individuals and families', bg: 'Хора и семейства' }, module: require('../../../output/pdf/sustainable-food-planner.pdf') },
  { id: 'climate-workshop', title: { en: 'Community Climate Workshop', bg: 'Общностна климатична работилница' }, audience: { en: 'Community leaders', bg: 'Общностни лидери' }, module: require('../../../output/pdf/community-climate-workshop.pdf') },
  { id: 'water-audit', title: { en: 'Water Stewardship Audit', bg: 'Проверка за грижа за водата' }, audience: { en: 'Homes and community spaces', bg: 'Домове и общностни места' }, module: require('../../../output/pdf/water-stewardship-audit.pdf') },
  { id: 'teacher-pack', title: { en: 'Teacher Learning Pack', bg: 'Учителски образователен пакет' }, audience: { en: 'Teachers and facilitators', bg: 'Учители и фасилитатори' }, module: require('../../../output/pdf/teacher-learning-pack.pdf') },
] as const;

export async function openKnowledgeToolkit(module: number) {
  const asset = Asset.fromModule(module);
  if (!asset.localUri) await asset.downloadAsync();
  const uri = asset.localUri || asset.uri;
  if (!uri) throw new Error('Toolkit file is unavailable.');
  await Linking.openURL(uri);
}

export function toolkitTitle(toolkit: typeof KNOWLEDGE_TOOLKITS[number], locale: KnowledgeLocale) {
  return toolkit.title[locale];
}
