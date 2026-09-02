import { DAILY_DOSES, KNOWLEDGE_ITEMS, KNOWLEDGE_TOPICS } from '../data/catalog';
import { validateKnowledgeItem } from '../validation';

describe('Knowledge Hub launch catalog', () => {
  it('covers every profile topic with an introduction and a practical guide', () => {
    expect(KNOWLEDGE_TOPICS).toHaveLength(10);
    for (const topic of KNOWLEDGE_TOPICS) {
      const topicItems = KNOWLEDGE_ITEMS.filter((item) => item.topicSlugs.includes(topic.slug));
      expect(topicItems.some((item) => item.type === 'article')).toBe(true);
      expect(topicItems.some((item) => item.type === 'guide')).toBe(true);
    }
  });

  it('provides a complete month of cited daily doses', () => {
    expect(DAILY_DOSES).toHaveLength(30);
    expect(DAILY_DOSES.every((item) => item.type === 'daily_fact' && item.sources.length > 0)).toBe(true);
  });

  it('passes editorial publication validation', () => {
    const issues = KNOWLEDGE_ITEMS.flatMap((item) => validateKnowledgeItem(item).map((issue) => ({ item: item.slug, issue })));
    expect(issues).toEqual([]);
  });

  it('does not leak English topic names into Bulgarian catalog titles', () => {
    const englishTopicNames = KNOWLEDGE_TOPICS.map((topic) => topic.name);
    const bulgarianTitles = KNOWLEDGE_ITEMS.filter((item) => item.locale === 'bg').map((item) => item.title);
    expect(bulgarianTitles.some((title) => englishTopicNames.some((name) => title.includes(name)))).toBe(false);
  });
});
