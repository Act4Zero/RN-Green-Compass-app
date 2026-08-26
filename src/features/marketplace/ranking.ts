import type { MarketplaceProductSummary, MarketplaceRecommendation, RecommendationSignals } from './types';

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-');

export function rankMarketplaceProducts(products: MarketplaceProductSummary[], signals: RecommendationSignals): MarketplaceRecommendation[] {
  const interests = new Set(signals.interests.map(normalize));
  const goals = new Set(signals.goalCategories.map(normalize));
  const habits = new Set(signals.habitCategories.map(normalize));
  const affinities = new Set(signals.affinityCategories.map(normalize));

  return products.map((product) => {
    const categories = new Set(product.categories.map((category) => normalize(category.slug)));
    const matchedInterests = matches(categories, interests);
    const matchedGoals = matches(categories, goals);
    const matchedHabits = matches(categories, habits);
    const matchedAffinities = matches(categories, affinities);
    const popularity = Math.min(1, Math.max(0, product.popularityScore / 100));
    const seasonalEditorial = product.featured ? 1 : 0;
    const score = matchedInterests * 35 + matchedGoals * 25 + matchedHabits * 15 + matchedAffinities * 10 + popularity * 10 + seasonalEditorial * 5;
    const reasons = [];
    if (matchedInterests) reasons.push({ en: 'Matches your sustainability interests', bg: 'Съответства на интересите ви за устойчивост' });
    if (matchedGoals) reasons.push({ en: 'Supports one of your active goals', bg: 'Подкрепя една от активните ви цели' });
    if (matchedHabits) reasons.push({ en: 'Complements your recent sustainable habits', bg: 'Допълва скорошните ви устойчиви навици' });
    if (!reasons.length && product.featured) reasons.push({ en: 'Selected by the Green Compass editorial team', bg: 'Избрано от редакционния екип на Green Compass' });
    if (!reasons.length) reasons.push({ en: 'Popular with the Green Compass community', bg: 'Популярно сред общността на Green Compass' });
    return { product, score, reasons: reasons.slice(0, 3) };
  }).sort((a, b) => b.score - a.score || b.product.sustainabilityRating - a.product.sustainabilityRating || a.product.id.localeCompare(b.product.id));
}

export function selectDailyMarketplacePick(recommendations: MarketplaceRecommendation[], userId: string, localDate: string, recentProductIds: string[] = []): MarketplaceRecommendation | null {
  if (!recommendations.length) return null;
  const available = recommendations.filter((entry) => !recentProductIds.includes(entry.product.id));
  const pool = (available.length ? available : recommendations).slice(0, Math.min(8, recommendations.length));
  return pool[stableHash(`${userId}:${localDate}`) % pool.length];
}

function matches(left: Set<string>, right: Set<string>): number {
  if (!right.size) return 0;
  let count = 0;
  left.forEach((value) => { if (right.has(value)) count += 1; });
  return Math.min(1, count / Math.max(1, Math.min(2, right.size)));
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
