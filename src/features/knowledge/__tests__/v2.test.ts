import { INFOGRAPHIC_ITEMS, KNOWLEDGE_BADGES, KNOWLEDGE_CHALLENGES, KNOWLEDGE_LEVELS, KNOWLEDGE_QUESTS, getAvailableQuestNodeIds, getKnowledgeLevel, validateChallengeConfig, validateQuestGraph } from '../data/v2Catalog';
import { KNOWLEDGE_ITEMS } from '../data/catalog';
import { validateKnowledgeItem } from '../validation';

describe('Knowledge Hub V2 launch contracts', () => {
  it.each(['en', 'bg'] as const)('ships ten accessible %s infographics', (locale) => {
    const items = INFOGRAPHIC_ITEMS.filter((item) => item.locale === locale);
    expect(items).toHaveLength(10);
    expect(new Set(items.map((item) => item.topicSlugs[0])).size).toBe(10);
    for (const item of items) {
      expect(validateKnowledgeItem(item)).toEqual([]);
      const graphic = item.body.find((block) => block.type === 'infographic');
      expect(graphic?.type === 'infographic' && graphic.textAlternative.length).toBeGreaterThan(30);
      expect(graphic?.type === 'infographic' && graphic.dataPoints.every((point) => Boolean(point.sourceId))).toBe(true);
    }
  });

  it('defines the six bounded personal challenges', () => {
    expect(KNOWLEDGE_CHALLENGES).toHaveLength(6);
    expect(KNOWLEDGE_CHALLENGES.map((challenge) => challenge.durationDays).sort((a, b) => a - b)).toEqual([3, 7, 7, 7, 7, 14]);
    for (const challenge of KNOWLEDGE_CHALLENGES) {
      expect(validateChallengeConfig(challenge)).toEqual([]);
      expect(challenge.steps.length).toBeGreaterThanOrEqual(3);
      expect(challenge.steps.length).toBeLessThanOrEqual(5);
      expect(challenge.rewardPoints).toBe(challenge.durationDays === 3 ? 20 : challenge.durationDays === 7 ? 35 : 60);
    }
  });

  it('routes every non-action mission step to published launch content', () => {
    const itemIds = new Set([...KNOWLEDGE_ITEMS, ...INFOGRAPHIC_ITEMS].map((item) => item.id));
    const steps = [...KNOWLEDGE_CHALLENGES.flatMap((challenge) => challenge.steps), ...KNOWLEDGE_QUESTS.flatMap((quest) => quest.nodes)];
    for (const step of steps) {
      if (step.kind === 'action') continue;
      expect(step.itemId).toBeTruthy();
      expect(itemIds.has(step.itemId!)).toBe(true);
    }
  });

  it('defines three valid branching quests with two optional bonus nodes', () => {
    expect(KNOWLEDGE_QUESTS).toHaveLength(3);
    for (const quest of KNOWLEDGE_QUESTS) {
      expect(validateQuestGraph(quest)).toEqual([]);
      expect(quest.nodes.filter((node) => node.bonus)).toHaveLength(2);
      expect(new Set(quest.nodes.filter((node) => node.branch).map((node) => node.branch)).size).toBe(2);
      const first = getAvailableQuestNodeIds(quest, []);
      expect(first).toHaveLength(1);
      expect(first[0]).toBe(quest.nodes[0].id);
      const afterFirst = getAvailableQuestNodeIds(quest, [quest.nodes[0].id]);
      expect(afterFirst).toContain(quest.nodes[1].id);
    }
  });

  it('uses the approved four-level thresholds and eight knowledge badges', () => {
    expect(KNOWLEDGE_LEVELS.map((level) => level.minimumXp)).toEqual([0, 50, 150, 350]);
    expect(getKnowledgeLevel(0).id).toBe('novice');
    expect(getKnowledgeLevel(50).id).toBe('explorer');
    expect(getKnowledgeLevel(150).id).toBe('builder');
    expect(getKnowledgeLevel(350).id).toBe('guru');
    expect(KNOWLEDGE_BADGES).toHaveLength(8);
    expect(new Set(KNOWLEDGE_BADGES.map((badge) => badge.code)).size).toBe(8);
  });
});
