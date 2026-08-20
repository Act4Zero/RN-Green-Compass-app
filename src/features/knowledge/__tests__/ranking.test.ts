import { KNOWLEDGE_ITEMS } from '../data/catalog';
import { rankKnowledgeItems } from '../ranking';

const summaries = KNOWLEDGE_ITEMS.filter((item) => !item.type.startsWith('daily_')).map(({ body: _body, sources: _sources, searchText: _search, author: _author, reviewer: _reviewer, version: _version, checksum: _checksum, ...item }) => item);

describe('Knowledge Hub recommendation ranking', () => {
  it('prioritizes explainable interest and habit matches', () => {
    const ranked = rankKnowledgeItems(summaries, {
      interests: ['Clean Energy'],
      activeCategories: ['Heating'],
      bookmarkedItemIds: [],
      progress: [],
      now: new Date('2026-08-19'),
    });
    expect(ranked[0].topicSlugs).toContain('clean-energy');
    expect(ranked[0].reason).toMatch(/interested in Clean Energy/i);
  });

  it('deprioritizes completed content and diversifies the first ten results', () => {
    const cleanEnergy = summaries.find((item) => item.topicSlugs.includes('clean-energy'))!;
    const ranked = rankKnowledgeItems(summaries, {
      interests: ['Clean Energy'],
      activeCategories: ['Heating'],
      bookmarkedItemIds: [],
      progress: [{ itemId: cleanEnergy.id, versionId: cleanEnergy.versionId, percent: 100, completed: true, updatedAt: '2026-08-19', eventId: 'event-1' }],
      now: new Date('2026-08-19'),
    });
    expect(ranked.findIndex((item) => item.id === cleanEnergy.id)).toBeGreaterThan(0);
    const counts = ranked.slice(0, 10).reduce<Record<string, number>>((result, item) => { const topic = item.topicSlugs[0]; result[topic] = (result[topic] || 0) + 1; return result; }, {});
    expect(Math.max(...Object.values(counts))).toBeLessThanOrEqual(2);
  });
});
