import { HABIT_TOPIC_MAP } from './data/catalog';
import type { KnowledgeItemSummary, KnowledgeProgress } from './types';

export interface RankingContext {
  interests: string[];
  activeCategories: string[];
  bookmarkedItemIds: string[];
  progress: KnowledgeProgress[];
  pathProgressByTopic?: Record<string, number>;
  now?: Date;
}

export interface RankedKnowledgeItem extends KnowledgeItemSummary {
  reason: string;
  score: number;
}

const normalizeTopic = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-');

export function rankKnowledgeItems(items: KnowledgeItemSummary[], context: RankingContext): RankedKnowledgeItem[] {
  const interestTopics = new Set(context.interests.map(normalizeTopic));
  const habitTopics = new Set(context.activeCategories.flatMap((category) => HABIT_TOPIC_MAP[category] || []));
  const bookmarks = new Set(context.bookmarkedItemIds);
  const completed = new Set(context.progress.filter((item) => item.completed).map((item) => item.itemId));
  const completedByDifficulty = (topic: string, difficulty: KnowledgeItemSummary['difficulty']) => items.filter((item) => item.topicSlugs.includes(topic) && item.difficulty === difficulty && completed.has(item.id)).length;
  const now = context.now ?? new Date();

  const ranked = items
    .filter((item) => !item.type.startsWith('daily_'))
    .map((item) => {
      const interestMatch = item.topicSlugs.find((topic) => interestTopics.has(topic));
      const habitMatch = item.topicSlugs.find((topic) => habitTopics.has(topic));
      const ageDays = Math.max(0, (now.getTime() - new Date(item.reviewedAt).getTime()) / 86_400_000);
      let score = 0;
      let reason = item.editorPick ? "Editor's pick" : 'A useful next step';

      if (interestMatch) {
        score += 4;
        reason = `Because you're interested in ${interestMatch.split('-').map(capitalize).join(' ')}`;
      }
      if (habitMatch) {
        score += 3;
        if (!interestMatch) reason = `Related to your ${habitMatch.split('-').map(capitalize).join(' ')} activity`;
      }
      if (bookmarks.has(item.id)) score += 2;
      if (ageDays <= 45) score += 1;
      if (completed.has(item.id)) score -= 6;
      if (item.editorPick) score += 1;
      const primaryTopic = item.topicSlugs[0];
      const desiredDifficulty: KnowledgeItemSummary['difficulty'] = completedByDifficulty(primaryTopic, 'intermediate') >= 2 || (context.pathProgressByTopic?.[primaryTopic] || 0) >= 60 ? 'advanced' : completedByDifficulty(primaryTopic, 'beginner') >= 2 ? 'intermediate' : 'beginner';
      if (item.difficulty === desiredDifficulty) {
        score += 2;
        if (!interestMatch && !habitMatch) reason = desiredDifficulty === 'beginner' ? 'A good place to begin' : `Your next ${desiredDifficulty} step`;
      } else if ((desiredDifficulty === 'beginner' && item.difficulty !== 'beginner') || (desiredDifficulty === 'intermediate' && item.difficulty === 'advanced')) score -= 2;

      return { ...item, score, reason };
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  const topicCounts = new Map<string, number>();
  const diversified: RankedKnowledgeItem[] = [];
  const deferred: RankedKnowledgeItem[] = [];

  for (const item of ranked) {
    const primaryTopic = item.topicSlugs[0] || 'general';
    const count = topicCounts.get(primaryTopic) || 0;
    if (diversified.length < 10 && count >= 2) {
      deferred.push(item);
      continue;
    }
    diversified.push(item);
    topicCounts.set(primaryTopic, count + 1);
  }

  return [...diversified, ...deferred];
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
