import type {
  KnowledgeBlock,
  KnowledgeAction,
  KnowledgeItemDetail,
  KnowledgeQuiz,
  KnowledgeSource,
  KnowledgeTopic,
  KnowledgeVisual,
} from '../types';
import { EXPERIENCE_ITEMS, EXTRA_DAILY_ITEMS, EXTRA_QUIZZES } from './experienceCatalog';

const REVIEWED_AT = '2026-08-01';
const NEXT_REVIEW_AT = '2027-02-01';

function topicVisual(slug: string, primary: string, secondary: string, foreground: string, surface: string, darkSurface: string, altEn: string, altBg: string, focalPoint = { x: 0.5, y: 0.5 }): KnowledgeVisual {
  return {
    illustrationKey: slug,
    alt: { en: altEn, bg: altBg },
    focalPoint,
    dimensions: { width: 1200, height: 800 },
    rights: { owner: 'Green Compass', license: 'Original commissioned artwork', generatedOn: '2026-08-19' },
    palette: { primary, secondary, foreground, surface, darkSurface },
  };
}

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  { id: 'topic-zero-waste', slug: 'zero-waste', name: 'Zero Waste', description: 'Prevent waste, reuse more, and make recycling count.', icon: 'trash-bin-outline', accent: '#4E9F6D', visual: topicVisual('zero-waste', '#245A3A', '#B7D65B', '#FFFFFF', '#EAF3DC', '#183224', 'Neighbors repair an appliance and share reusable containers in a circular scene.', 'Съседи ремонтират уред и споделят съдове за многократна употреба.'), order: 1 },
  { id: 'topic-clean-energy', slug: 'clean-energy', name: 'Clean Energy', description: 'Use energy wisely and understand the clean transition.', icon: 'flash-outline', accent: '#D99A2B', visual: topicVisual('clean-energy', '#145C72', '#F3BF36', '#FFFFFF', '#E7F4F4', '#112F38', 'A diverse community explores solar, wind and efficient homes.', 'Разнообразна общност разглежда слънчева и вятърна енергия и ефективни домове.'), order: 2 },
  { id: 'topic-sustainable-food', slug: 'sustainable-food', name: 'Sustainable Food', description: 'Choose food systems that support people and planet.', icon: 'nutrition-outline', accent: '#A66A3F', visual: topicVisual('sustainable-food', '#5B6330', '#E1783B', '#FFFFFF', '#F5EAD7', '#342A20', 'People grow, prepare and share seasonal vegetables in a community garden.', 'Хора отглеждат, приготвят и споделят сезонни зеленчуци в общностна градина.'), order: 3 },
  { id: 'topic-ethical-fashion', slug: 'ethical-fashion', name: 'Ethical Fashion', description: 'Buy less, care longer, and ask better questions.', icon: 'shirt-outline', accent: '#9A6FB0', visual: topicVisual('ethical-fashion', '#543652', '#C18A9E', '#FFFFFF', '#F4E8EC', '#2F202F', 'People mend, swap and upcycle clothing in a welcoming studio.', 'Хора поправят, разменят и обновяват дрехи в приветливо ателие.'), order: 4 },
  { id: 'topic-conservation', slug: 'conservation', name: 'Conservation', description: 'Protect habitats, biodiversity, and shared natural spaces.', icon: 'paw-outline', accent: '#397E73', visual: topicVisual('conservation', '#125958', '#E47862', '#FFFFFF', '#E4F1EC', '#123433', 'A field team observes birds and restores plants beside a wetland.', 'Теренен екип наблюдава птици и възстановява растения край влажна зона.'), order: 5 },
  { id: 'topic-climate-action', slug: 'climate-action', name: 'Climate Action', description: 'Understand climate change and choose effective action.', icon: 'earth-outline', accent: '#356B91', visual: topicVisual('climate-action', '#244C5D', '#E46F51', '#FFFFFF', '#E4EEF0', '#172F38', 'Neighbors plan shade, retrofit homes and plant trees for a resilient community.', 'Съседи планират сянка, обновяват домове и засаждат дървета за устойчива общност.'), order: 6 },
  { id: 'topic-water-conservation', slug: 'water-conservation', name: 'Water Conservation', description: 'Reduce water waste at home and in your community.', icon: 'water-outline', accent: '#3B88A7', visual: topicVisual('water-conservation', '#17637A', '#ED765C', '#FFFFFF', '#E2F2F3', '#123743', 'A community collects rainwater and tends a rain garden beside an urban stream.', 'Общност събира дъждовна вода и се грижи за дъждовна градина край градски поток.'), order: 7 },
  { id: 'topic-green-transportation', slug: 'green-transportation', name: 'Green Transportation', description: 'Move with fewer emissions and healthier streets.', icon: 'bicycle-outline', accent: '#5279A5', visual: topicVisual('green-transportation', '#164F78', '#F1B846', '#FFFFFF', '#E6EEF5', '#142D43', 'People walk, cycle and use accessible public transport on a green city street.', 'Хора вървят пеша, карат велосипеди и използват достъпен обществен транспорт.'), order: 8 },
  { id: 'topic-permaculture', slug: 'permaculture', name: 'Permaculture', description: 'Design resilient gardens and regenerative systems.', icon: 'flower-outline', accent: '#778E3F', visual: topicVisual('permaculture', '#4D5C2C', '#C47B38', '#FFFFFF', '#F1EBD8', '#302F1F', 'Adults and children build soil and share seeds in an abundant permaculture garden.', 'Възрастни и деца подобряват почвата и споделят семена в пермакултурна градина.'), order: 9 },
  { id: 'topic-sustainable-building', slug: 'sustainable-building', name: 'Sustainable Building', description: 'Create efficient, comfortable, lower-impact spaces.', icon: 'business-outline', accent: '#8B7455', visual: topicVisual('sustainable-building', '#5A5140', '#C96F4B', '#FFFFFF', '#EFE9DC', '#342E25', 'Residents and designers examine an efficient wall in a shaded green neighborhood.', 'Жители и проектанти разглеждат ефективна стена в зелен и сенчест квартал.'), order: 10 },
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
  'Preventing waste usually preserves more value than processing discarded material.',
  'Insulation and airtightness can reduce energy demand before new equipment is considered.',
  'Storing food well helps households use what they buy before it spoils.',
  'Repair and care can lower the demand created by frequently replacing clothes.',
  'Connected habitats help wildlife move, feed, and reproduce.',
  'Climate adaptation reduces exposure and vulnerability to present and future hazards.',
  'Fixing a leak saves treated water every hour that the leak would otherwise continue.',
  'Compact neighbourhoods can make walking, cycling, and public transport more practical.',
  'Healthy soil holds water and supports diverse organisms that cycle nutrients.',
  'Shading and passive ventilation can improve comfort with less mechanical cooling.',
  'A waste audit shows which materials can be prevented before choosing new recycling bins.',
  'Efficient appliances reduce demand, but settings and everyday use still affect consumption.',
  'A flexible meal plan can prioritise perishable ingredients and reduce avoidable waste.',
  'Second-hand clothing extends the useful life of products that already exist.',
  'Native plants can provide food and shelter adapted to local wildlife.',
  'Cutting emissions and preparing for impacts are complementary climate strategies.',
  'Water used outdoors can often be reduced by watering soil deeply and less frequently.',
  'Safe crossings and protected routes influence whether active travel feels realistic.',
  'Observing sun, wind, water, and soil comes before changing a permaculture site.',
  'Building maintenance protects efficiency gains and helps materials last longer.',
];

const dailyFactsBg = [
  'Ремонтът преди замяна запазва материалите в употреба по-дълго.',
  'Ходенето и колоезденето могат да намалят емисиите и да подкрепят ежедневното здраве.',
  'Планирането на храненето е лесен начин за предотвратяване на хранителен отпадък.',
  'Изборите за отопление и охлаждане силно влияят на домашното потребление на енергия.',
  'Местните растения могат да подкрепят биоразнообразието с по-малко интензивна грижа.',
  'Предметът за многократна употреба помага само когато се използва многократно.',
  'По-рядкото пране на по-ниска температура може да удължи живота на дрехите.',
  'Чистата енергия и енергийната ефективност работят най-добре заедно.',
  'Краткият душ спестява вода и енергията за нейното затопляне.',
  'Общественият транспорт използва градското пространство по-ефективно.',
  'Предотвратяването на отпадък обикновено запазва повече стойност от обработката му след изхвърляне.',
  'Изолацията и въздухоплътността могат да намалят енергийните нужди преди смяна на оборудването.',
  'Правилното съхранение помага храната да бъде използвана, преди да се развали.',
  'Ремонтът и грижата намаляват нуждата от честа подмяна на дрехите.',
  'Свързаните местообитания помагат на дивите животни да се движат, хранят и размножават.',
  'Климатичната адаптация намалява изложеността и уязвимостта към настоящи и бъдещи опасности.',
  'Поправянето на теч спестява пречистена вода през всеки час, в който течът би продължил.',
  'Компактните квартали правят ходенето, колоезденето и обществения транспорт по-практични.',
  'Здравата почва задържа вода и поддържа организми, които осигуряват кръговрата на хранителните вещества.',
  'Засенчването и пасивната вентилация подобряват комфорта с по-малко механично охлаждане.',
  'Одитът на отпадъците показва какво може да се предотврати преди добавяне на нови кошчета.',
  'Ефективните уреди намаляват потреблението, но настройките и начинът на употреба също имат значение.',
  'Гъвкавото меню може да даде приоритет на нетрайните продукти и да намали отпадъка.',
  'Дрехите втора употреба удължават полезния живот на вече произведени продукти.',
  'Местните растения осигуряват храна и убежище, подходящи за местната дива природа.',
  'Намаляването на емисиите и подготовката за въздействията са допълващи се климатични стратегии.',
  'Поливането на почвата по-дълбоко и по-рядко често намалява външното потребление на вода.',
  'Безопасните пресичания и защитените маршрути влияят дали активното придвижване е реалистично.',
  'Наблюдението на слънцето, вятъра, водата и почвата предхожда промяната на пермакултурно място.',
  'Поддръжката на сградата пази ефективността и помага на материалите да издържат по-дълго.',
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
    type: 'daily_fact',
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

const bootstrapBgItems: KnowledgeItemDetail[] = [...coreItems, ...quizItems, ...DAILY_DOSES].map((item) => {
  const topic = KNOWLEDGE_TOPICS.find((entry) => entry.slug === item.topicSlugs[0])!;
  const kind = item.type === 'article' ? 'Обяснение' : item.type === 'guide' ? 'Практическо ръководство' : item.type === 'quiz' ? 'Проверка на знанията' : 'Ежедневна идея';
  const dailyIndex = item.type === 'daily_fact' ? Number(item.id.replace('daily-', '')) - 1 : -1;
  const title = dailyIndex >= 0 ? dailyFactsBg[dailyIndex] : `${topic.name}: ${kind}`;
  return {
    ...item,
    versionId: `${item.versionId}-bg`,
    slug: `${item.slug}-bg`,
    locale: 'bg',
    title,
    summary: `Проверено въведение в темата „${topic.name}“ с ясни стъпки, източници и практично действие.`,
    body: dailyIndex >= 0 ? [
      { id: `${item.id}-bg-body`, type: 'paragraph', text: dailyFactsBg[dailyIndex] },
      { id: `${item.id}-bg-context`, type: 'callout', tone: 'success', title: 'Опитайте днес', text: 'Открийте къде тази идея се вписва в рутината ви и проследете резултата.' },
    ] : [
      { id: `${item.id}-bg-intro`, type: 'paragraph', text: `${topic.description} Материалът свързва надеждната информация с изпълнима ежедневна стъпка.` },
      { id: `${item.id}-bg-why`, type: 'callout', tone: 'info', title: 'Защо това е важно', text: 'Устойчивата промяна започва с контекст, измерима цел и редовен преглед на резултата.' },
      { id: `${item.id}-bg-steps`, type: 'checklist', items: ['Наблюдавайте сегашната си рутина.', 'Изберете една измерима промяна.', 'Опитайте я за седем дни.', 'Прегледайте резултата и коригирайте.'] },
    ],
    searchText: `${title} ${topic.name} устойчивост ${item.sources[0]?.publisher || ''}`.toLowerCase(),
    checksum: `${item.checksum}-bg`,
  } as KnowledgeItemDetail;
});

export const ALL_DAILY_DOSES: KnowledgeItemDetail[] = [...DAILY_DOSES, ...bootstrapBgItems.filter((item) => item.type === 'daily_fact'), ...EXTRA_DAILY_ITEMS];
export const KNOWLEDGE_ITEMS: KnowledgeItemDetail[] = [...coreItems, ...quizItems, ...DAILY_DOSES, ...bootstrapBgItems, ...EXPERIENCE_ITEMS];

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

function questionsForBg(item: KnowledgeItemDetail): KnowledgeQuiz {
  const sourceId = item.sources[0].id;
  return {
    id: `quiz-${item.id}-bg`, itemId: item.id, passingScore: 80,
    questions: Array.from({ length: 5 }, (_, index) => ({
      id: `${item.id}-bg-q${index + 1}`,
      prompt: `Кой избор е най-надежден в ситуация ${index + 1}?`,
      options: [{ id: 'a', text: 'Измеримо действие, подкрепено с проверен източник' }, { id: 'b', text: 'Непроверено твърдение без контекст' }, { id: 'c', text: 'Да не се проследява резултатът' }],
      correctOptionId: 'a', explanation: 'Измеримото действие позволява резултатът да бъде проверен и подобрен.', sourceId,
    })),
  };
}

export const KNOWLEDGE_QUIZZES: KnowledgeQuiz[] = [...quizItems.map(questionsFor), ...bootstrapBgItems.filter((item) => item.type === 'quiz').map(questionsForBg), ...EXTRA_QUIZZES];

export const HABIT_TOPIC_MAP: Record<string, string[]> = {
  Mobility: ['green-transportation'],
  Food: ['sustainable-food'],
  'Household Activities': ['zero-waste', 'water-conservation', 'clean-energy'],
  Heating: ['clean-energy', 'sustainable-building'],
};
