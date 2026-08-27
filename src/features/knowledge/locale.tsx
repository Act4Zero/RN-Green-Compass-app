import type { KnowledgeLocale } from './types';
import type { KnowledgeTopic } from './types';
export { AppLocaleProvider as KnowledgeLocaleProvider, useAppLocale as useKnowledgeLocale } from '@/context/AppLocaleContext';

const TOPIC_BG: Record<string, { name: string; description: string }> = {
  'zero-waste': { name: 'Нулев отпадък', description: 'Предотвратявайте отпадъци, използвайте повторно и рециклирайте правилно.' },
  'clean-energy': { name: 'Чиста енергия', description: 'Използвайте енергията разумно и разберете чистия преход.' },
  'sustainable-food': { name: 'Устойчива храна', description: 'Избирайте хранителни системи, добри за хората и планетата.' },
  'ethical-fashion': { name: 'Етична мода', description: 'Купувайте по-малко, грижете се по-дълго и задавайте по-добри въпроси.' },
  conservation: { name: 'Опазване на природата', description: 'Пазете местообитанията, биоразнообразието и общите природни места.' },
  'climate-action': { name: 'Действия за климата', description: 'Разберете климатичните промени и избирайте ефективни действия.' },
  'water-conservation': { name: 'Грижа за водата', description: 'Намалете загубите на вода у дома и в общността.' },
  'green-transportation': { name: 'Устойчива мобилност', description: 'Придвижвайте се с по-малко емисии и по-здравословни улици.' },
  permaculture: { name: 'Пермакултура', description: 'Проектирайте устойчиви градини и регенеративни системи.' },
  'sustainable-building': { name: 'Устойчиво строителство', description: 'Създавайте ефективни, комфортни и по-щадящи пространства.' },
};

export function localizedTopic(topic: KnowledgeTopic, locale: KnowledgeLocale) {
  return locale === 'bg' && TOPIC_BG[topic.slug] ? TOPIC_BG[topic.slug] : { name: topic.name, description: topic.description };
}
