import type {
  KnowledgeBlock,
  KnowledgeAction,
  KnowledgeItemDetail,
  KnowledgeQuiz,
  KnowledgeSource,
  KnowledgeTopic,
} from '../types';

const REVIEWED_AT = '2026-08-01';
const NEXT_REVIEW_AT = '2027-02-01';

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  { id: 'topic-zero-waste', slug: 'zero-waste', name: 'Zero Waste', description: 'Prevent waste, reuse more, and make recycling count.', icon: 'trash-bin-outline', accent: '#4E9F6D', order: 1 },
  { id: 'topic-clean-energy', slug: 'clean-energy', name: 'Clean Energy', description: 'Use energy wisely and understand the clean transition.', icon: 'flash-outline', accent: '#D99A2B', order: 2 },
  { id: 'topic-sustainable-food', slug: 'sustainable-food', name: 'Sustainable Food', description: 'Choose food systems that support people and planet.', icon: 'nutrition-outline', accent: '#A66A3F', order: 3 },
  { id: 'topic-ethical-fashion', slug: 'ethical-fashion', name: 'Ethical Fashion', description: 'Buy less, care longer, and ask better questions.', icon: 'shirt-outline', accent: '#9A6FB0', order: 4 },
  { id: 'topic-conservation', slug: 'conservation', name: 'Conservation', description: 'Protect habitats, biodiversity, and shared natural spaces.', icon: 'paw-outline', accent: '#397E73', order: 5 },
  { id: 'topic-climate-action', slug: 'climate-action', name: 'Climate Action', description: 'Understand climate change and choose effective action.', icon: 'earth-outline', accent: '#356B91', order: 6 },
  { id: 'topic-water-conservation', slug: 'water-conservation', name: 'Water Conservation', description: 'Reduce water waste at home and in your community.', icon: 'water-outline', accent: '#3B88A7', order: 7 },
  { id: 'topic-green-transportation', slug: 'green-transportation', name: 'Green Transportation', description: 'Move with fewer emissions and healthier streets.', icon: 'bicycle-outline', accent: '#5279A5', order: 8 },
  { id: 'topic-permaculture', slug: 'permaculture', name: 'Permaculture', description: 'Design resilient gardens and regenerative systems.', icon: 'flower-outline', accent: '#778E3F', order: 9 },
  { id: 'topic-sustainable-building', slug: 'sustainable-building', name: 'Sustainable Building', description: 'Create efficient, comfortable, lower-impact spaces.', icon: 'business-outline', accent: '#8B7455', order: 10 },
];

const SOURCES: Record<string, KnowledgeSource> = {
  unep: { id: 'source-unep', publisher: 'United Nations Environment Programme', title: 'UNEP sustainability resources', url: 'https://www.unep.org/', sourceType: 'intergovernmental', accessedOn: REVIEWED_AT },
  ipcc: { id: 'source-ipcc', publisher: 'Intergovernmental Panel on Climate Change', title: 'AR6 Synthesis Report', url: 'https://www.ipcc.ch/report/ar6/syr/', sourceType: 'research', publishedOn: '2023-03-20', accessedOn: REVIEWED_AT },
  iea: { id: 'source-iea', publisher: 'International Energy Agency', title: 'Energy efficiency', url: 'https://www.iea.org/topics/energy-efficiency', sourceType: 'intergovernmental', accessedOn: REVIEWED_AT },
  fao: { id: 'source-fao', publisher: 'Food and Agriculture Organization', title: 'Sustainable food and agriculture', url: 'https://www.fao.org/sustainability/en/', sourceType: 'intergovernmental', accessedOn: REVIEWED_AT },
  epa: { id: 'source-epa', publisher: 'U.S. Environmental Protection Agency', title: 'Sustainability resources', url: 'https://www.epa.gov/sustainability', sourceType: 'government', accessedOn: REVIEWED_AT },
  iucn: { id: 'source-iucn', publisher: 'International Union for Conservation of Nature', title: 'Conservation resources', url: 'https://www.iucn.org/', sourceType: 'ngo', accessedOn: REVIEWED_AT },
  unwater: { id: 'source-unwater', publisher: 'UN-Water', title: 'Water facts', url: 'https://www.unwater.org/water-facts', sourceType: 'intergovernmental', accessedOn: REVIEWED_AT },
  who: { id: 'source-who', publisher: 'World Health Organization', title: 'Transport, health and environment', url: 'https://www.who.int/health-topics/environmental-health', sourceType: 'intergovernmental', accessedOn: REVIEWED_AT },
};

const topicSource: Record<string, KnowledgeSource> = {
  'zero-waste': SOURCES.epa,
  'clean-energy': SOURCES.iea,
  'sustainable-food': SOURCES.fao,
  'ethical-fashion': SOURCES.unep,
  conservation: SOURCES.iucn,
  'climate-action': SOURCES.ipcc,
  'water-conservation': SOURCES.unwater,
  'green-transportation': SOURCES.who,
  permaculture: SOURCES.fao,
  'sustainable-building': SOURCES.iea,
};

const topicAction: Record<string, { type: 'habit' | 'goal' | 'map'; label: string; route: '/habits/log' | '/habits/goal' | '/map'; category?: string; query?: string }> = {
  'zero-waste': { type: 'habit', label: 'Log a lower-waste action', route: '/habits/log', category: 'Household Activities' },
  'clean-energy': { type: 'goal', label: 'Set an energy goal', route: '/habits/goal', category: 'Heating' },
  'sustainable-food': { type: 'habit', label: 'Log a food action', route: '/habits/log', category: 'Food' },
  'ethical-fashion': { type: 'goal', label: 'Create a reuse goal', route: '/habits/goal', category: 'Household Activities' },
  conservation: { type: 'map', label: 'Explore nearby places', route: '/map', query: 'Community' },
  'climate-action': { type: 'goal', label: 'Set a climate goal', route: '/habits/goal' },
  'water-conservation': { type: 'habit', label: 'Log a water-saving action', route: '/habits/log', category: 'Household Activities' },
  'green-transportation': { type: 'habit', label: 'Log a mobility action', route: '/habits/log', category: 'Mobility' },
  permaculture: { type: 'goal', label: 'Start a growing goal', route: '/habits/goal', category: 'Food' },
  'sustainable-building': { type: 'goal', label: 'Set a home energy goal', route: '/habits/goal', category: 'Heating' },
};

function blocksFor(topic: KnowledgeTopic, source: KnowledgeSource, practical: boolean): KnowledgeBlock[] {
  const action = topicAction[topic.slug] as KnowledgeAction;
  return [
    { id: `${topic.slug}-why`, type: 'heading', level: 2, text: 'Why this matters' },
    { id: `${topic.slug}-intro`, type: 'paragraph', text: `${topic.description} The most useful changes are evidence-informed, realistic for daily life, and repeated over time.` },
    { id: `${topic.slug}-callout`, type: 'callout', tone: 'info', title: 'Start with context', text: `Look at your current routine before choosing a change. A smaller ${topic.name.toLowerCase()} action that lasts is more valuable than a perfect plan that stops after a week.` },
    { id: `${topic.slug}-steps`, type: practical ? 'checklist' : 'list', items: practical ? ['Notice one repeated choice this week.', 'Choose one change you can measure.', 'Try it for seven days.', 'Review the result and adjust.'] : ['Understand the system behind the issue.', 'Prioritize high-impact choices.', 'Use trustworthy sources.', 'Connect learning to a repeatable action.'] },
    { id: `${topic.slug}-source`, type: 'stat', value: '1 step', label: 'Choose one measurable improvement to begin today.', sourceId: source.id },
    { id: `${topic.slug}-action`, type: 'action', title: 'Turn this into action', text: 'Connect this lesson to a Green Compass habit or goal.', action },
  ];
}

function makeItem(topic: KnowledgeTopic, practical: boolean, index: number): KnowledgeItemDetail {
  const source = topicSource[topic.slug];
  const slug = `${topic.slug}-${practical ? 'starter-guide' : 'explained'}`;
  const title = practical ? `${topic.name}: a practical starter guide` : `${topic.name}, explained`;
  const summary = practical ? `Four realistic steps for bringing ${topic.name.toLowerCase()} into everyday life.` : `A clear introduction to ${topic.name.toLowerCase()}, its impact, and the choices that matter most.`;
  const action = topicAction[topic.slug] as KnowledgeAction;
  const searchText = `${title} ${summary} ${topic.name} ${source.publisher}`.toLowerCase();
  return {
    id: `knowledge-${topic.slug}-${practical ? 'guide' : 'intro'}`,
    versionId: `version-${topic.slug}-${practical ? 'guide' : 'intro'}-1`,
    slug,
    locale: 'en',
    type: practical ? 'guide' : 'article',
    title,
    summary,
    topicSlugs: [topic.slug],
    difficulty: index > 6 && !practical ? 'intermediate' : 'beginner',
    estimatedMinutes: practical ? 6 : 8,
    publishedAt: `2026-07-${String((index % 20) + 1).padStart(2, '0')}`,
    reviewedAt: REVIEWED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
    downloadable: practical,
    editorPick: index < 4 && !practical,
    action,
    author: 'Green Compass Editorial Team',
    reviewer: 'Green Compass Sustainability Review',
    body: blocksFor(topic, source, practical),
    sources: [source],
    searchText,
    version: 1,
    checksum: `${topic.slug}-${practical ? 'guide' : 'intro'}-v1`,
  };
}

const coreItems = KNOWLEDGE_TOPICS.flatMap((topic, index) => [makeItem(topic, false, index), makeItem(topic, true, index)]);

const dailyFacts = [
  'Repairing before replacing keeps materials in use for longer.',
  'Walking and cycling can reduce emissions while supporting everyday health.',
  'Planning meals is one of the simplest ways to prevent avoidable food waste.',
  'Heating and cooling choices strongly influence household energy use.',
  'Native plants can support local biodiversity with less intensive care.',
  'A reusable item only helps when it is used repeatedly.',
  'Washing clothes less often and at lower temperatures can extend their life.',
  'Clean energy and energy efficiency work best together.',
  'Short showers save both water and the energy used to heat it.',
  'Public transport makes urban mobility more space-efficient.',
];

export const DAILY_DOSES: KnowledgeItemDetail[] = Array.from({ length: 30 }, (_, index) => {
  const topic = KNOWLEDGE_TOPICS[index % KNOWLEDGE_TOPICS.length];
  const source = topicSource[topic.slug];
  const fact = dailyFacts[index % dailyFacts.length];
  return {
    id: `daily-${index + 1}`,
    versionId: `daily-${index + 1}-v1`,
    slug: `daily-dose-${index + 1}`,
    locale: 'en',
    type: 'daily',
    title: fact,
    summary: `Today's small insight connects to ${topic.name.toLowerCase()}.`,
    topicSlugs: [topic.slug],
    difficulty: 'beginner',
    estimatedMinutes: 2,
    publishedAt: `2026-08-${String(index + 1).padStart(2, '0')}`,
    reviewedAt: REVIEWED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
    downloadable: false,
    author: 'Green Compass Editorial Team',
    reviewer: 'Green Compass Sustainability Review',
    body: [
      { id: `daily-${index + 1}-body`, type: 'paragraph', text: fact },
      { id: `daily-${index + 1}-context`, type: 'callout', tone: 'success', title: 'Try it today', text: 'Notice one place where this idea fits your routine. Small repeated choices create visible progress.' },
    ],
    sources: [source],
    searchText: `${fact} ${topic.name} ${source.publisher}`.toLowerCase(),
    version: 1,
    checksum: `daily-${index + 1}-v1`,
  };
});

function quizItem(id: string, title: string, summary: string, topicSlug: string): KnowledgeItemDetail {
  const source = topicSource[topicSlug];
  return {
    id,
    versionId: `${id}-v1`,
    slug: id,
    locale: 'en',
    type: 'quiz',
    title,
    summary,
    topicSlugs: [topicSlug],
    difficulty: 'beginner',
    estimatedMinutes: 5,
    publishedAt: '2026-08-01',
    reviewedAt: REVIEWED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
    downloadable: false,
    author: 'Green Compass Editorial Team',
    reviewer: 'Green Compass Sustainability Review',
    body: [{ id: `${id}-intro`, type: 'paragraph', text: 'Use this short assessment to reinforce the practical ideas in the Hub. Every answer includes an explanation and source.' }],
    sources: [source],
    searchText: `${title} ${summary} ${topicSlug} quiz`.toLowerCase(),
    version: 1,
    checksum: `${id}-v1`,
  };
}

const quizItems = [
  quizItem('climate-action-basics-quiz', 'Climate action basics', 'Check your understanding of effective, everyday climate action.', 'climate-action'),
  quizItem('lower-waste-choices-quiz', 'Lower-waste choices', 'Practice choosing prevention, reuse, and responsible recycling.', 'zero-waste'),
  quizItem('clean-energy-home-quiz', 'Clean energy at home', 'Test the relationship between efficiency and cleaner energy.', 'clean-energy'),
];

export const KNOWLEDGE_ITEMS: KnowledgeItemDetail[] = [...coreItems, ...quizItems, ...DAILY_DOSES];

function questionsFor(item: KnowledgeItemDetail): KnowledgeQuiz {
  const sourceId = item.sources[0].id;
  return {
    id: `quiz-${item.id}`,
    itemId: item.id,
    passingScore: 80,
    questions: [
      { id: `${item.id}-q1`, prompt: 'What is the strongest way to make a sustainability change last?', options: [{ id: 'a', text: 'Choose a measurable action that fits your routine' }, { id: 'b', text: 'Attempt every possible change at once' }, { id: 'c', text: 'Wait until the perfect solution exists' }], correctOptionId: 'a', explanation: 'A realistic, measurable action is easier to repeat and evaluate.', sourceId },
      { id: `${item.id}-q2`, prompt: 'Which information should guide an environmental claim?', options: [{ id: 'a', text: 'An unattributed social post' }, { id: 'b', text: 'A current, reputable source with visible evidence' }, { id: 'c', text: 'A product slogan' }], correctOptionId: 'b', explanation: 'Trustworthy claims identify their evidence, publisher, and review date.', sourceId },
      { id: `${item.id}-q3`, prompt: 'What should you do after trying a new action?', options: [{ id: 'a', text: 'Review the result and adjust' }, { id: 'b', text: 'Ignore whether it helped' }, { id: 'c', text: 'Assume one action solves the whole issue' }], correctOptionId: 'a', explanation: 'Reflection helps turn an experiment into a sustainable habit.', sourceId },
      { id: `${item.id}-q4`, prompt: 'Which approach is most useful?', options: [{ id: 'a', text: 'Connect learning to a practical next step' }, { id: 'b', text: 'Collect facts without acting' }, { id: 'c', text: 'Hide the underlying sources' }], correctOptionId: 'a', explanation: 'Knowledge becomes useful when it informs an achievable action.', sourceId },
      { id: `${item.id}-q5`, prompt: 'When should guidance be reviewed?', options: [{ id: 'a', text: 'Never' }, { id: 'b', text: 'Only when a user complains' }, { id: 'c', text: 'On a defined schedule and when evidence changes' }], correctOptionId: 'c', explanation: 'Scheduled review keeps guidance current and trustworthy.', sourceId },
    ],
  };
}

export const KNOWLEDGE_QUIZZES: KnowledgeQuiz[] = quizItems.map(questionsFor);

export const HABIT_TOPIC_MAP: Record<string, string[]> = {
  Mobility: ['green-transportation'],
  Food: ['sustainable-food'],
  'Household Activities': ['zero-waste', 'water-conservation', 'clean-energy'],
  Heating: ['clean-energy', 'sustainable-building'],
};
