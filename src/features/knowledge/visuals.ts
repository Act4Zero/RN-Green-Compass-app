import type { ImageSourcePropType } from 'react-native';
import type { KnowledgeItemSummary, KnowledgeTopic, KnowledgeVisual } from './types';

export const KNOWLEDGE_ILLUSTRATIONS: Record<string, ImageSourcePropType> = {
  'zero-waste': require('../../../assets/images/knowledge/zero-waste.webp'),
  'clean-energy': require('../../../assets/images/knowledge/clean-energy.webp'),
  'sustainable-food': require('../../../assets/images/knowledge/sustainable-food.webp'),
  'ethical-fashion': require('../../../assets/images/knowledge/ethical-fashion.webp'),
  conservation: require('../../../assets/images/knowledge/conservation.webp'),
  'climate-action': require('../../../assets/images/knowledge/climate-action.webp'),
  'water-conservation': require('../../../assets/images/knowledge/water-conservation.webp'),
  'green-transportation': require('../../../assets/images/knowledge/green-transportation.webp'),
  permaculture: require('../../../assets/images/knowledge/permaculture.webp'),
  'sustainable-building': require('../../../assets/images/knowledge/sustainable-building.webp'),
};

export function resolveKnowledgeVisual(item: Pick<KnowledgeItemSummary, 'topicSlugs' | 'visual'>, topics: KnowledgeTopic[]) {
  const topic = topics.find((entry) => entry.slug === item.topicSlugs[0]) || topics[0];
  const visual: KnowledgeVisual = { ...topic.visual, ...item.visual } as KnowledgeVisual;
  return {
    source: KNOWLEDGE_ILLUSTRATIONS[visual.illustrationKey] || KNOWLEDGE_ILLUSTRATIONS[topic.slug],
    visual,
    topic,
  };
}

export function knowledgeImagePosition(visual: KnowledgeVisual) {
  return `${Math.round(visual.focalPoint.x * 100)}% ${Math.round(visual.focalPoint.y * 100)}%`;
}
