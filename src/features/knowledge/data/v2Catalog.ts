import { KNOWLEDGE_ITEMS, KNOWLEDGE_TOPICS } from './catalog';
import type {
  KnowledgeBadgeSummary,
  KnowledgeChallenge,
  KnowledgeInfographicTemplate,
  KnowledgeItemDetail,
  KnowledgeLevel,
  KnowledgeLocale,
  KnowledgeMissionStep,
  KnowledgeQuest,
  KnowledgeQuestNode,
} from '../types';

const REVIEWED_AT = '2026-08-26';
const NEXT_REVIEW_AT = '2027-02-26';

const INFOGRAPHIC_COPY: Record<string, { title: Record<KnowledgeLocale, string>; description: Record<KnowledgeLocale, string>; steps: Record<KnowledgeLocale, string[]> }> = {
  'zero-waste': { title: { en: 'The zero-waste decision ladder', bg: 'Стълбата на решенията без отпадък' }, description: { en: 'Move from prevention to responsible recovery.', bg: 'Преминете от предотвратяване към отговорно оползотворяване.' }, steps: { en: ['Refuse what is unnecessary', 'Reduce what you use', 'Reuse and repair', 'Recycle what remains'], bg: ['Откажете ненужното', 'Намалете използваното', 'Използвайте и поправяйте', 'Рециклирайте останалото'] } },
  'clean-energy': { title: { en: 'A smarter home-energy sequence', bg: 'По-разумен ред за домашната енергия' }, description: { en: 'Efficiency comes before choosing a cleaner supply.', bg: 'Ефективността предхожда избора на по-чиста енергия.' }, steps: { en: ['Measure current use', 'Remove avoidable waste', 'Improve efficiency', 'Choose cleaner supply'], bg: ['Измерете потреблението', 'Премахнете излишното', 'Подобрете ефективността', 'Изберете по-чиста енергия'] } },
  'sustainable-food': { title: { en: 'Food choices from plan to plate', bg: 'Изборите за храна — от плана до чинията' }, description: { en: 'Four connected decisions reduce avoidable food impacts.', bg: 'Четири свързани решения намаляват излишното въздействие.' }, steps: { en: ['Plan from what you have', 'Choose seasonal variety', 'Store food well', 'Use leftovers safely'], bg: ['Планирайте с наличното', 'Изберете сезонно разнообразие', 'Съхранявайте правилно', 'Използвайте остатъците безопасно'] } },
  'ethical-fashion': { title: { en: 'The longer-life wardrobe', bg: 'Гардероб с по-дълъг живот' }, description: { en: 'Care, repair and reuse keep materials useful.', bg: 'Грижата, ремонтът и повторната употреба запазват материалите полезни.' }, steps: { en: ['Pause before buying', 'Check materials and maker', 'Care and repair', 'Resell, swap or recycle'], bg: ['Спрете преди покупка', 'Проверете материалите', 'Грижете се и поправяйте', 'Продайте, разменете или рециклирайте'] } },
  conservation: { title: { en: 'How local habitats connect', bg: 'Как се свързват местните местообитания' }, description: { en: 'Small protected places can support a wider living network.', bg: 'Малките защитени места могат да подпомагат по-широка жива мрежа.' }, steps: { en: ['Observe without disturbing', 'Protect food and shelter', 'Connect green spaces', 'Record and share evidence'], bg: ['Наблюдавайте без намеса', 'Пазете храна и укритие', 'Свързвайте зелени площи', 'Записвайте и споделяйте данни'] } },
  'climate-action': { title: { en: 'Climate action at three scales', bg: 'Климатични действия в три мащаба' }, description: { en: 'Personal, community and policy choices reinforce one another.', bg: 'Личните, общностните и политическите решения се подсилват.' }, steps: { en: ['Understand the evidence', 'Reduce direct impacts', 'Act with your community', 'Support system change'], bg: ['Разберете доказателствата', 'Намалете прякото въздействие', 'Действайте с общността', 'Подкрепете системната промяна'] } },
  'water-conservation': { title: { en: 'A household water check', bg: 'Проверка на водата у дома' }, description: { en: 'Find losses before changing everyday routines.', bg: 'Открийте загубите преди да променяте ежедневните навици.' }, steps: { en: ['Read the meter', 'Check for leaks', 'Improve fixtures', 'Review food and garden use'], bg: ['Отчетете водомера', 'Проверете за течове', 'Подобрете оборудването', 'Прегледайте храната и градината'] } },
  'green-transportation': { title: { en: 'Choose a lower-impact journey', bg: 'Изберете пътуване с по-ниско въздействие' }, description: { en: 'Start with access and safety, then compare transport modes.', bg: 'Започнете с достъп и безопасност, после сравнете начините на транспорт.' }, steps: { en: ['Avoid an unnecessary trip', 'Walk or cycle safely', 'Use shared transport', 'Improve unavoidable car travel'], bg: ['Избегнете ненужно пътуване', 'Ходете или карайте безопасно', 'Използвайте споделен транспорт', 'Подобрете неизбежното пътуване с кола'] } },
  permaculture: { title: { en: 'Observe before you design', bg: 'Наблюдавайте преди да проектирате' }, description: { en: 'A simple loop for place-based regenerative choices.', bg: 'Прост цикъл за възстановяващи решения според мястото.' }, steps: { en: ['Observe sun, water and wind', 'Map needs and resources', 'Test a small change', 'Learn and adapt'], bg: ['Наблюдавайте слънце, вода и вятър', 'Картирайте нужди и ресурси', 'Изпробвайте малка промяна', 'Учете и адаптирайте'] } },
  'sustainable-building': { title: { en: 'A building-performance pathway', bg: 'Път към по-ефективна сграда' }, description: { en: 'Comfort and efficiency begin with the building fabric.', bg: 'Комфортът и ефективността започват от обвивката на сградата.' }, steps: { en: ['Understand the climate', 'Reduce heating and cooling demand', 'Use efficient systems', 'Add clean energy'], bg: ['Разберете климата', 'Намалете нуждата от отопление и охлаждане', 'Използвайте ефективни системи', 'Добавете чиста енергия'] } },
};

const TEMPLATES: KnowledgeInfographicTemplate[] = ['process', 'comparison', 'timeline', 'proportion'];

export const INFOGRAPHIC_ITEMS: KnowledgeItemDetail[] = KNOWLEDGE_TOPICS.flatMap((topic, topicIndex) => {
  const copy = INFOGRAPHIC_COPY[topic.slug];
  const source = KNOWLEDGE_ITEMS.find((item) => item.locale === 'en' && item.topicSlugs.includes(topic.slug))?.sources[0];
  if (!copy || !source) return [];
  return (['en', 'bg'] as KnowledgeLocale[]).map((locale) => {
    const title = copy.title[locale];
    const description = copy.description[locale];
    const steps = copy.steps[locale];
    return {
      id: `infographic-${topic.slug}`,
      versionId: `infographic-${topic.slug}-${locale}-v1`,
      slug: `${topic.slug}-visual-guide`,
      locale,
      type: 'infographic' as const,
      title,
      summary: description,
      topicSlugs: [topic.slug],
      difficulty: 'beginner' as const,
      estimatedMinutes: 4,
      publishedAt: `${REVIEWED_AT}T08:00:00.000Z`,
      reviewedAt: REVIEWED_AT,
      nextReviewAt: NEXT_REVIEW_AT,
      downloadable: true,
      editorPick: topicIndex < 4,
      author: 'Green Compass Editorial Team',
      reviewer: 'Green Compass Knowledge Review',
      visual: topic.visual,
      body: [
        { id: `infographic-${topic.slug}-intro-${locale}`, type: 'paragraph' as const, text: description },
        {
          id: `infographic-${topic.slug}-graphic-${locale}`,
          type: 'infographic' as const,
          template: TEMPLATES[topicIndex % TEMPLATES.length],
          title,
          description,
          dataPoints: steps.map((label, index) => ({ id: `${topic.slug}-${index + 1}`, label, value: index + 1, displayValue: `${index + 1}`, sourceId: source.id })),
          takeaways: [steps[0], steps[steps.length - 1]],
          textAlternative: `${description} ${steps.map((step, index) => `${index + 1}. ${step}.`).join(' ')}`,
        },
        { id: `infographic-${topic.slug}-source-${locale}`, type: 'callout' as const, tone: 'info' as const, title: locale === 'bg' ? 'Проверен източник' : 'Reviewed source', text: `${source.publisher}: ${source.title}` },
      ],
      sources: [source],
      searchText: `${title} ${description} ${steps.join(' ')} ${source.publisher}`.toLowerCase(),
      version: 1,
      checksum: `infographic-${topic.slug}-${locale}-v1`,
      formatLabel: locale === 'bg' ? 'Инфографика' : 'Infographic',
    };
  });
});

const step = (id: string, kind: KnowledgeMissionStep['kind'], en: string, bg: string, itemId?: string, prerequisiteIds: string[] = [], bonus = false): KnowledgeMissionStep => ({
  id, kind, title: { en, bg }, itemId, required: !bonus, prerequisiteIds, bonus,
});
const questNode = (base: KnowledgeMissionStep, options: Pick<KnowledgeQuestNode, 'branch' | 'rewardPoints'> = {}): KnowledgeQuestNode => ({ ...base, ...options });

export const KNOWLEDGE_CHALLENGES: KnowledgeChallenge[] = [
  { id: 'challenge-climate-3', slug: 'climate-basics-3-days', title: { en: 'Climate Basics in 3 Days', bg: 'Основи на климата за 3 дни' }, summary: { en: 'Build a source-backed climate foundation in three focused sessions.', bg: 'Изградете проверена основа за климата в три фокусирани сесии.' }, topicSlug: 'climate-action', durationDays: 3, rewardPoints: 20, steps: [step('climate-read', 'content', 'Read the climate primer', 'Прочетете основния урок', 'knowledge-climate-action-intro'), step('climate-visual', 'content', 'Explore the climate visual guide', 'Разгледайте визуалното ръководство', 'infographic-climate-action', ['climate-read']), step('climate-quiz', 'quiz', 'Pass the climate quiz', 'Преминете теста за климата', 'climate-action-basics-quiz', ['climate-visual'])] },
  { id: 'challenge-energy-7', slug: 'energy-efficiency-sprint', title: { en: 'Energy Efficiency Sprint', bg: 'Спринт за енергийна ефективност' }, summary: { en: 'Measure, compare and improve one week of home energy choices.', bg: 'Измервайте, сравнявайте и подобрявайте домашните енергийни решения за седмица.' }, topicSlug: 'clean-energy', durationDays: 7, rewardPoints: 35, steps: [step('energy-read', 'content', 'Learn the efficiency sequence', 'Научете реда за ефективност', 'knowledge-clean-energy-intro'), step('energy-sim', 'simulation', 'Run the home energy lab', 'Изпълнете домашната енергийна лаборатория', 'home-energy-simulation', ['energy-read']), step('energy-quiz', 'quiz', 'Pass the clean-energy quiz', 'Преминете теста за чиста енергия', 'clean-energy-home-quiz', ['energy-sim']), step('energy-action', 'action', 'Log one energy habit', 'Запишете един енергиен навик', undefined, ['energy-quiz'])] },
  { id: 'challenge-plastic-7', slug: 'plastic-free-kickstart', title: { en: 'Plastic-Free Kickstart', bg: 'Старт с по-малко пластмаса' }, summary: { en: 'Replace avoidable single-use choices without perfection pressure.', bg: 'Заменете излишните еднократни продукти без натиск за съвършенство.' }, topicSlug: 'zero-waste', durationDays: 7, rewardPoints: 35, steps: [step('plastic-read', 'content', 'Read the low-waste guide', 'Прочетете ръководството за по-малко отпадъци', 'knowledge-zero-waste-guide'), step('plastic-diy', 'diy', 'Complete the reuse DIY', 'Завършете DIY за повторна употреба', 'zero-waste-diy-project', ['plastic-read']), step('plastic-quiz', 'quiz', 'Pass the lower-waste quiz', 'Преминете теста за по-малко отпадъци', 'lower-waste-choices-quiz', ['plastic-diy'])] },
  { id: 'challenge-food-7', slug: 'food-waste-reset', title: { en: 'Food Waste Reset', bg: 'Рестарт срещу хранителния отпадък' }, summary: { en: 'Plan, store and use food more intentionally for seven days.', bg: 'Планирайте, съхранявайте и използвайте храната по-съзнателно седем дни.' }, topicSlug: 'sustainable-food', durationDays: 7, rewardPoints: 35, steps: [step('food-read', 'content', 'Learn the food decision loop', 'Научете цикъла за хранителни решения', 'knowledge-sustainable-food-guide'), step('food-sim', 'simulation', 'Run the food-waste lab', 'Изпълнете лабораторията за хранителен отпадък', 'food-waste-simulation', ['food-read']), step('food-quiz', 'quiz', 'Pass the food skills quiz', 'Преминете теста за устойчиво хранене', 'sustainable-food-skills-quiz', ['food-sim'])] },
  { id: 'challenge-travel-7', slug: 'sustainable-travel-week', title: { en: 'Sustainable Travel Week', bg: 'Седмица на устойчивото придвижване' }, summary: { en: 'Compare realistic mobility choices for everyday journeys.', bg: 'Сравнете реалистични решения за ежедневните пътувания.' }, topicSlug: 'green-transportation', durationDays: 7, rewardPoints: 35, steps: [step('travel-read', 'content', 'Read the transport guide', 'Прочетете ръководството за транспорт', 'knowledge-green-transportation-guide'), step('travel-sim', 'simulation', 'Run the mobility lab', 'Изпълнете лабораторията за придвижване', 'mobility-simulation', ['travel-read']), step('travel-quiz', 'quiz', 'Pass the transport quiz', 'Преминете теста за транспорт', 'green-transportation-skills-quiz', ['travel-sim'])] },
  { id: 'challenge-home-14', slug: 'green-home-builder', title: { en: 'Green Home Builder', bg: 'Създател на по-зелен дом' }, summary: { en: 'Connect energy, water, materials and everyday habits over two weeks.', bg: 'Свържете енергия, вода, материали и ежедневни навици за две седмици.' }, topicSlug: 'sustainable-building', durationDays: 14, rewardPoints: 60, steps: [step('home-read', 'content', 'Read the green building guide', 'Прочетете ръководството за зелени сгради', 'knowledge-sustainable-building-guide'), step('home-water', 'content', 'Review the household water check', 'Прегледайте проверката на водата', 'infographic-water-conservation', ['home-read']), step('home-energy', 'simulation', 'Run the energy lab', 'Изпълнете енергийната лаборатория', 'home-energy-simulation', ['home-water']), step('home-action', 'action', 'Create one measurable home habit', 'Създайте измерим домашен навик', undefined, ['home-energy'])] },
];

export const KNOWLEDGE_QUESTS: KnowledgeQuest[] = [
  { id: 'quest-energy-detective', slug: 'home-energy-detective', title: { en: 'Home Energy Detective', bg: 'Домашен енергиен детектив' }, summary: { en: 'Follow evidence from the meter to a practical home decision.', bg: 'Проследете доказателствата от електромера до практично домашно решение.' }, topicSlug: 'clean-energy', rewardPoints: 50, nodes: [step('qe-1', 'content', 'Open the case', 'Отворете случая', 'knowledge-clean-energy-intro'), step('qe-2', 'content', 'Read the visual clues', 'Прочетете визуалните улики', 'infographic-clean-energy', ['qe-1']), questNode(step('qe-3a', 'simulation', 'Test an efficiency scenario', 'Тествайте сценарий за ефективност', 'home-energy-simulation', ['qe-2']), { branch: 'efficiency' }), questNode(step('qe-3b', 'content', 'Investigate clean supply', 'Проучете чистото снабдяване', 'clean-energy-field-notes', ['qe-2']), { branch: 'supply' }), step('qe-4', 'quiz', 'Prove your findings', 'Докажете изводите си', 'clean-energy-home-quiz', ['qe-3a', 'qe-3b']), step('qe-5', 'action', 'Commit to one action', 'Поемете един ангажимент', undefined, ['qe-4']), questNode(step('qe-bonus-1', 'content', 'Mastery: building performance', 'Майсторство: ефективност на сградата', 'infographic-sustainable-building', ['qe-4'], true), { rewardPoints: 10 }), questNode(step('qe-bonus-2', 'content', 'Bonus: water and energy', 'Бонус: вода и енергия', 'infographic-water-conservation', ['qe-4'], true), { rewardPoints: 10 })] },
  { id: 'quest-waste-kitchen', slug: 'low-waste-kitchen', title: { en: 'Low-Waste Kitchen', bg: 'Кухня с по-малко отпадъци' }, summary: { en: 'Connect planning, storage and reuse in a branching kitchen journey.', bg: 'Свържете планиране, съхранение и повторна употреба в разклонено пътешествие.' }, topicSlug: 'zero-waste', rewardPoints: 50, nodes: [step('qw-1', 'content', 'Start with prevention', 'Започнете с предотвратяване', 'knowledge-zero-waste-intro'), step('qw-2', 'content', 'Map the decision ladder', 'Проследете стълбата на решенията', 'infographic-zero-waste', ['qw-1']), questNode(step('qw-3a', 'simulation', 'Test food-waste choices', 'Тествайте решения за хранителен отпадък', 'food-waste-simulation', ['qw-2']), { branch: 'food' }), questNode(step('qw-3b', 'diy', 'Build a reuse routine', 'Създайте навик за повторна употреба', 'zero-waste-diy-project', ['qw-2']), { branch: 'reuse' }), step('qw-4', 'quiz', 'Check your strategy', 'Проверете стратегията си', 'lower-waste-choices-quiz', ['qw-3a', 'qw-3b']), step('qw-5', 'action', 'Log a low-waste habit', 'Запишете навик с по-малко отпадъци', undefined, ['qw-4']), questNode(step('qw-bonus-1', 'content', 'Bonus: food systems view', 'Бонус: поглед към хранителните системи', 'infographic-sustainable-food', ['qw-4'], true), { rewardPoints: 10 }), questNode(step('qw-bonus-2', 'diy', 'Bonus: advanced reuse', 'Бонус: напреднала повторна употреба', 'zero-waste-diy-project', ['qw-4'], true), { rewardPoints: 10 })] },
  { id: 'quest-climate-solutions', slug: 'climate-solutions-trail', title: { en: 'Climate Solutions Trail', bg: 'Пътека на климатичните решения' }, summary: { en: 'Move from climate evidence to personal and collective action.', bg: 'Преминете от климатичните доказателства към лично и общо действие.' }, topicSlug: 'climate-action', rewardPoints: 50, nodes: [step('qc-1', 'content', 'Understand the evidence', 'Разберете доказателствата', 'knowledge-climate-action-intro'), step('qc-2', 'content', 'See the scales of action', 'Вижте мащабите на действие', 'infographic-climate-action', ['qc-1']), questNode(step('qc-3a', 'tour', 'Visit a resilient community', 'Посетете устойчива общност', 'sustainable-community-tour', ['qc-2']), { branch: 'community' }), questNode(step('qc-3b', 'content', 'Study climate field notes', 'Проучете теренните бележки', 'climate-action-field-notes', ['qc-2']), { branch: 'evidence' }), step('qc-4', 'quiz', 'Test your climate knowledge', 'Проверете знанията си', 'climate-action-basics-quiz', ['qc-3a', 'qc-3b']), step('qc-5', 'action', 'Share or log an action', 'Споделете или запишете действие', undefined, ['qc-4']), questNode(step('qc-bonus-1', 'content', 'Bonus: biodiversity connection', 'Бонус: връзка с биоразнообразието', 'infographic-conservation', ['qc-4'], true), { rewardPoints: 10 }), questNode(step('qc-bonus-2', 'tour', 'Bonus: wetlands field visit', 'Бонус: посещение на влажна зона', 'wetland-tour', ['qc-4'], true), { rewardPoints: 10 })] },
];

export const KNOWLEDGE_LEVELS: KnowledgeLevel[] = [
  { id: 'novice', name: { en: 'Sustainability Novice', bg: 'Начинаещ в устойчивостта' }, minimumXp: 0, nextMinimumXp: 50 },
  { id: 'explorer', name: { en: 'Eco Explorer', bg: 'Еко изследовател' }, minimumXp: 50, nextMinimumXp: 150 },
  { id: 'builder', name: { en: 'Green Builder', bg: 'Зелен създател' }, minimumXp: 150, nextMinimumXp: 350 },
  { id: 'guru', name: { en: 'Green Guru', bg: 'Зелен гуру' }, minimumXp: 350, nextMinimumXp: null },
];

export const KNOWLEDGE_BADGES: Omit<KnowledgeBadgeSummary, 'earned'>[] = [
  { code: 'knowledge_first_step', name: { en: 'First Step', bg: 'Първа стъпка' }, description: { en: 'Complete a first learning item.', bg: 'Завършете първия си учебен материал.' } },
  { code: 'knowledge_curious_learner', name: { en: 'Curious Learner', bg: 'Любознателен ученик' }, description: { en: 'Complete five learning items.', bg: 'Завършете пет учебни материала.' } },
  { code: 'knowledge_quiz_ace', name: { en: 'Quiz Ace', bg: 'Майстор на тестовете' }, description: { en: 'Pass three quizzes.', bg: 'Преминете успешно три теста.' } },
  { code: 'knowledge_pathfinder', name: { en: 'Pathfinder', bg: 'Откривател на пътеки' }, description: { en: 'Complete a learning path.', bg: 'Завършете учебна пътека.' } },
  { code: 'knowledge_experimenter', name: { en: 'Experimenter', bg: 'Експериментатор' }, description: { en: 'Complete three interactive tools.', bg: 'Завършете три интерактивни инструмента.' } },
  { code: 'knowledge_challenge_finisher', name: { en: 'Challenge Finisher', bg: 'Финалист в предизвикателство' }, description: { en: 'Finish a learning challenge on time.', bg: 'Завършете учебно предизвикателство навреме.' } },
  { code: 'knowledge_quest_seeker', name: { en: 'Quest Seeker', bg: 'Търсач на мисии' }, description: { en: 'Complete a Knowledge Quest.', bg: 'Завършете приключение за знания.' } },
  { code: 'knowledge_green_guru', name: { en: 'Green Guru', bg: 'Зелен гуру' }, description: { en: 'Reach 350 learning XP.', bg: 'Достигнете 350 learning XP.' } },
];

export function getKnowledgeLevel(xp: number): KnowledgeLevel {
  return [...KNOWLEDGE_LEVELS].reverse().find((level) => xp >= level.minimumXp) || KNOWLEDGE_LEVELS[0];
}

export function getAvailableQuestNodeIds(quest: KnowledgeQuest, completedNodeIds: string[]): string[] {
  const completed = new Set(completedNodeIds);
  return quest.nodes.filter((node) => !completed.has(node.id) && (node.prerequisiteIds.length === 0 || node.prerequisiteIds.some((id) => completed.has(id)))).map((node) => node.id);
}

export function validateQuestGraph(quest: KnowledgeQuest): string[] {
  const ids = new Set(quest.nodes.map((node) => node.id));
  const issues: string[] = [];
  const visit = (id: string, path: Set<string>) => {
    if (path.has(id)) return issues.push(`Circular prerequisite at ${id}`);
    const node = quest.nodes.find((entry) => entry.id === id);
    if (!node) return;
    const next = new Set(path).add(id);
    node.prerequisiteIds.forEach((parent) => { if (!ids.has(parent)) issues.push(`Missing prerequisite ${parent}`); else visit(parent, next); });
  };
  quest.nodes.forEach((node) => visit(node.id, new Set()));
  return [...new Set(issues)];
}

export function validateChallengeConfig(challenge: KnowledgeChallenge): string[] {
  const issues: string[] = [];
  const ids = new Set(challenge.steps.map((entry) => entry.id));
  if (!challenge.title.en.trim() || !challenge.title.bg.trim() || !challenge.summary.en.trim() || !challenge.summary.bg.trim()) issues.push('Missing bilingual challenge copy');
  if (challenge.steps.length < 3 || challenge.steps.length > 5) issues.push('Challenge must have 3–5 steps');
  if (challenge.rewardPoints !== (challenge.durationDays === 3 ? 20 : challenge.durationDays === 7 ? 35 : 60)) issues.push('Reward is outside the approved duration range');
  challenge.steps.forEach((entry) => {
    if (!entry.title.en.trim() || !entry.title.bg.trim()) issues.push(`Missing bilingual copy for ${entry.id}`);
    if (entry.kind !== 'action' && !entry.itemId) issues.push(`Missing destination for ${entry.id}`);
    entry.prerequisiteIds.forEach((parent) => { if (!ids.has(parent)) issues.push(`Missing prerequisite ${parent}`); });
  });
  return [...new Set(issues)];
}
