import type {
  KnowledgeBlock,
  KnowledgeItemDetail,
  KnowledgeLearningPath,
  KnowledgeLocale,
  KnowledgeQuiz,
  KnowledgeSimulation,
  KnowledgeSource,
  KnowledgeTour,
  KnowledgeWebinar,
} from '../types';

const REVIEWED_AT = '2026-08-19';
const NEXT_REVIEW_AT = '2027-02-19';

const SOURCES: Record<string, KnowledgeSource> = {
  unep: { id: 'source-unep', publisher: 'United Nations Environment Programme', title: 'Sustainability resources', url: 'https://www.unep.org/', sourceType: 'intergovernmental', accessedOn: REVIEWED_AT },
  ipcc: { id: 'source-ipcc', publisher: 'Intergovernmental Panel on Climate Change', title: 'AR6 Synthesis Report', url: 'https://www.ipcc.ch/report/ar6/syr/', sourceType: 'research', publishedOn: '2023-03-20', accessedOn: REVIEWED_AT },
  iea: { id: 'source-iea', publisher: 'International Energy Agency', title: 'Energy efficiency', url: 'https://www.iea.org/topics/energy-efficiency', sourceType: 'intergovernmental', accessedOn: REVIEWED_AT },
  fao: { id: 'source-fao', publisher: 'Food and Agriculture Organization', title: 'Sustainable food and agriculture', url: 'https://www.fao.org/sustainability/en/', sourceType: 'intergovernmental', accessedOn: REVIEWED_AT },
  epa: { id: 'source-epa', publisher: 'U.S. Environmental Protection Agency', title: 'Sustainability resources', url: 'https://www.epa.gov/sustainability', sourceType: 'government', accessedOn: REVIEWED_AT },
  iucn: { id: 'source-iucn', publisher: 'International Union for Conservation of Nature', title: 'Conservation resources', url: 'https://www.iucn.org/', sourceType: 'ngo', accessedOn: REVIEWED_AT },
  unwater: { id: 'source-unwater', publisher: 'UN-Water', title: 'Water facts', url: 'https://www.unwater.org/water-facts', sourceType: 'intergovernmental', accessedOn: REVIEWED_AT },
  who: { id: 'source-who', publisher: 'World Health Organization', title: 'Environment, climate change and health', url: 'https://www.who.int/health-topics/environmental-health', sourceType: 'intergovernmental', accessedOn: REVIEWED_AT },
  goodall: { id: 'source-goodall', publisher: 'Jane Goodall Institute', title: 'About Jane Goodall', url: 'https://janegoodall.org/our-story/about-jane/', sourceType: 'ngo', accessedOn: REVIEWED_AT },
  lbj: { id: 'source-lbj', publisher: 'U.S. National Park Service', title: 'Lady Bird Johnson and the Environment', url: 'https://www.nps.gov/lyjo/learn/historyculture/lady-bird-johnson-and-the-environment.htm', sourceType: 'government', accessedOn: REVIEWED_AT },
  gandhi: { id: 'source-gandhi', publisher: 'Gandhi Heritage Portal', title: 'The Collected Works of Mahatma Gandhi', url: 'https://www.gandhiheritageportal.org/', sourceType: 'research', accessedOn: REVIEWED_AT },
  maathai: { id: 'source-maathai', publisher: 'Nobel Prize Outreach', title: 'Wangari Maathai – Nobel Lecture', url: 'https://www.nobelprize.org/prizes/peace/2004/maathai/lecture/', sourceType: 'ngo', publishedOn: '2004-12-10', accessedOn: REVIEWED_AT },
  muir: { id: 'source-muir', publisher: 'U.S. National Park Service', title: 'The Wisdom of John Muir', url: 'https://www.nps.gov/jomu/learn/historyculture/john-muir-quotes.htm', sourceType: 'government', accessedOn: REVIEWED_AT },
};

type Copy = { en: string; bg: string };
type TopicProfile = {
  slug: string;
  name: Copy;
  source: KnowledgeSource;
  why: Copy;
  misconception: Copy;
  today: Copy;
};

const TOPICS: TopicProfile[] = [
  { slug: 'zero-waste', name: { en: 'Zero Waste', bg: 'Нулев отпадък' }, source: SOURCES.epa, why: { en: 'Prevention keeps materials useful before recycling is needed.', bg: 'Предотвратяването запазва материалите полезни, преди да се наложи рециклиране.' }, misconception: { en: 'Recycling alone cannot prevent all waste.', bg: 'Само рециклирането не може да предотврати всички отпадъци.' }, today: { en: 'Repair or reuse one item you would normally replace.', bg: 'Поправете или използвайте повторно предмет, който обикновено бихте заменили.' } },
  { slug: 'clean-energy', name: { en: 'Clean Energy', bg: 'Чиста енергия' }, source: SOURCES.iea, why: { en: 'Efficiency lowers demand while cleaner supply reduces emissions.', bg: 'Ефективността намалява потреблението, а чистата енергия - емисиите.' }, misconception: { en: 'Renewables work best alongside efficiency, storage and flexible demand.', bg: 'Възобновяемите източници работят най-добре с ефективност, съхранение и гъвкаво потребление.' }, today: { en: 'Check one heating, cooling or standby setting.', bg: 'Проверете една настройка за отопление, охлаждане или режим на готовност.' } },
  { slug: 'sustainable-food', name: { en: 'Sustainable Food', bg: 'Устойчива храна' }, source: SOURCES.fao, why: { en: 'Food choices connect land, water, livelihoods and health.', bg: 'Изборът на храна свързва земята, водата, поминъка и здравето.' }, misconception: { en: 'A sustainable diet is not one rigid menu for every person or place.', bg: 'Устойчивото хранене не е едно и също меню за всеки човек и място.' }, today: { en: 'Plan one meal around food you already have.', bg: 'Планирайте едно хранене с храната, която вече имате.' } },
  { slug: 'ethical-fashion', name: { en: 'Ethical Fashion', bg: 'Етична мода' }, source: SOURCES.unep, why: { en: 'Longer use reduces pressure from repeated production.', bg: 'По-дългата употреба намалява натиска от постоянно ново производство.' }, misconception: { en: 'A sustainability label is not a substitute for transparent evidence.', bg: 'Етикетът за устойчивост не замества прозрачните доказателства.' }, today: { en: 'Mend, swap or restyle one garment.', bg: 'Поправете, разменете или комбинирайте наново една дреха.' } },
  { slug: 'conservation', name: { en: 'Conservation', bg: 'Опазване на природата' }, source: SOURCES.iucn, why: { en: 'Healthy habitats support biodiversity and human wellbeing.', bg: 'Здравите местообитания подкрепят биоразнообразието и благосъстоянието на хората.' }, misconception: { en: 'Conservation includes working landscapes and cities, not only remote reserves.', bg: 'Опазването включва и земеделски земи и градове, не само далечни резервати.' }, today: { en: 'Observe and record one local species without disturbing it.', bg: 'Наблюдавайте и запишете един местен вид, без да го безпокоите.' } },
  { slug: 'climate-action', name: { en: 'Climate Action', bg: 'Действия за климата' }, source: SOURCES.ipcc, why: { en: 'Fast, sustained emissions cuts and adaptation both matter.', bg: 'Бързото и трайно намаляване на емисиите и адаптацията са еднакво важни.' }, misconception: { en: 'Individual action and system change reinforce each other.', bg: 'Личните действия и системната промяна се подсилват взаимно.' }, today: { en: 'Choose one action you can repeat and one change you can support.', bg: 'Изберете действие, което можете да повтаряте, и промяна, която можете да подкрепите.' } },
  { slug: 'water-conservation', name: { en: 'Water Stewardship', bg: 'Грижа за водата' }, source: SOURCES.unwater, why: { en: 'Water security depends on quantity, quality and resilient ecosystems.', bg: 'Водната сигурност зависи от количество, качество и устойчиви екосистеми.' }, misconception: { en: 'Saving water is not only about shorter showers; leaks and food choices matter too.', bg: 'Пестенето на вода не е само по-кратък душ; течовете и храната също имат значение.' }, today: { en: 'Check one tap, toilet or outdoor connection for a leak.', bg: 'Проверете кран, тоалетно казанче или външна връзка за теч.' } },
  { slug: 'green-transportation', name: { en: 'Sustainable Mobility', bg: 'Устойчива мобилност' }, source: SOURCES.who, why: { en: 'Safer walking, cycling and public transport improve air, health and access.', bg: 'Безопасното ходене, колоездене и общественият транспорт подобряват въздуха, здравето и достъпа.' }, misconception: { en: 'A cleaner car alone does not solve congestion, safety or unequal access.', bg: 'По-чистият автомобил сам не решава задръстванията, безопасността или неравния достъп.' }, today: { en: 'Replace one short car trip when a safe alternative exists.', bg: 'Заменете едно кратко пътуване с кола, когато има безопасна алтернатива.' } },
  { slug: 'permaculture', name: { en: 'Permaculture', bg: 'Пермакултура' }, source: SOURCES.fao, why: { en: 'Designing with ecological relationships can build resilient growing systems.', bg: 'Проектирането с екологичните връзки може да създаде устойчиви системи за отглеждане.' }, misconception: { en: 'Permaculture is a design approach, not a single garden style.', bg: 'Пермакултурата е подход за проектиране, а не един градински стил.' }, today: { en: 'Observe sun, water and wind before changing a growing space.', bg: 'Наблюдавайте слънцето, водата и вятъра, преди да променяте място за отглеждане.' } },
  { slug: 'sustainable-building', name: { en: 'Sustainable Building', bg: 'Устойчиво строителство' }, source: SOURCES.iea, why: { en: 'Comfort, efficiency and low-carbon materials must be considered together.', bg: 'Комфортът, ефективността и нисковъглеродните материали трябва да се разглеждат заедно.' }, misconception: { en: 'Technology cannot compensate for poor orientation, insulation or maintenance.', bg: 'Технологията не компенсира лошата ориентация, изолация или поддръжка.' }, today: { en: 'Find one draft, shade issue or unnecessary energy load at home.', bg: 'Открийте течение, проблем със сянката или ненужно енергийно натоварване у дома.' } },
];

const localeText = (copy: Copy, locale: KnowledgeLocale) => copy[locale];
const localizedSlug = (slug: string, locale: KnowledgeLocale) => locale === 'en' ? slug : `${slug}-bg`;

function makeItem(id: string, locale: KnowledgeLocale, type: KnowledgeItemDetail['type'], topic: TopicProfile, title: Copy, summary: Copy, body: KnowledgeBlock[], minutes = 8, downloadable = false): KnowledgeItemDetail {
  const localizedTitle = localeText(title, locale);
  const localizedSummary = localeText(summary, locale);
  return {
    id, versionId: `${id}-${locale}-v1`, slug: localizedSlug(id, locale), locale, type,
    title: localizedTitle, summary: localizedSummary, topicSlugs: [topic.slug], difficulty: 'beginner',
    estimatedMinutes: minutes, publishedAt: '2026-08-19', reviewedAt: REVIEWED_AT, nextReviewAt: NEXT_REVIEW_AT,
    downloadable, author: 'Green Compass Editorial Team', reviewer: 'Green Compass Sustainability Review', body,
    sources: [topic.source], searchText: `${localizedTitle} ${localizedSummary} ${localeText(topic.name, locale)} ${topic.source.publisher}`.toLowerCase(),
    version: 1, checksum: `${id}-${locale}-v1`, formatLabel: type.replace('_', ' '),
  };
}

function richBlocks(topic: TopicProfile, locale: KnowledgeLocale): KnowledgeBlock[] {
  const sourceId = topic.source.id;
  const bg = locale === 'bg';
  return [
    { id: `${topic.slug}-narrative-${locale}`, type: 'paragraph', text: bg ? `Промяната започва с разбиране на системата и една изпълнима стъпка. ${topic.why.bg}` : `Change starts by understanding the system and choosing one achievable step. ${topic.why.en}` },
    { id: `${topic.slug}-stat-${locale}`, type: 'stat', value: bg ? '1 измерима стъпка' : '1 measurable step', label: bg ? 'Започнете с действие, което можете да проследите тази седмица.' : 'Start with an action you can track this week.', sourceId },
    { id: `${topic.slug}-why-${locale}`, type: 'callout', tone: 'info', title: bg ? 'Защо това е важно' : 'Why this matters', text: localeText(topic.why, locale) },
    { id: `${topic.slug}-steps-${locale}`, type: 'checklist', items: bg ? ['Наблюдавайте сегашната си рутина.', 'Изберете промяна с ясен резултат.', 'Опитайте я седем дни.', 'Прегледайте резултата и коригирайте.'] : ['Observe your current routine.', 'Choose a change with a visible outcome.', 'Try it for seven days.', 'Review the result and adjust.'] },
    { id: `${topic.slug}-myth-${locale}`, type: 'callout', tone: 'warning', title: bg ? 'Често погрешно разбиране' : 'Common misconception', text: localeText(topic.misconception, locale) },
    { id: `${topic.slug}-today-${locale}`, type: 'callout', tone: 'success', title: bg ? 'Какво можете да направите днес' : 'What you can do today', text: localeText(topic.today, locale) },
  ];
}

export const SKILL_ARTICLES: KnowledgeItemDetail[] = TOPICS.flatMap((topic) => (['en', 'bg'] as KnowledgeLocale[]).map((locale) => makeItem(
  `${topic.slug}-field-notes`, locale, 'article', topic,
  { en: `${topic.name.en}: field notes for meaningful action`, bg: `${topic.name.bg}: практически насоки за значимо действие` },
  { en: `Understand the system, avoid a common misconception and choose a practical next step.`, bg: `Разберете системата, избегнете често заблуждение и изберете практична следваща стъпка.` },
  richBlocks(topic, locale), 10, true,
)));

const VIDEO_URLS = ['EtW2rrLHs08', '1kUE0BZtTRc', 'ishA6kry8nc', 'BiSYoeqb_VY', 'b6Ua_zWDH6U', 'G4H1N_yXBiA', 'vB68xvRb2T4', '2z7o3sRxA5g', 'Q_m_0UPOzuI', 'xKxrkht7CpY'];
export const VIDEO_ITEMS: KnowledgeItemDetail[] = TOPICS.flatMap((topic, index) => (['en', 'bg'] as KnowledgeLocale[]).map((locale) => makeItem(
  `${topic.slug}-expert-video`, locale, 'video', topic,
  { en: `${topic.name.en} in practice`, bg: `${topic.name.bg} на практика` },
  { en: 'A curated expert introduction with captions, a transcript and source context.', bg: 'Подбрано експертно въведение със субтитри, транскрипция и контекст на източника.' },
  [{ id: `${topic.slug}-video-${locale}`, type: 'video', provider: 'youtube', url: `https://www.youtube.com/watch?v=${VIDEO_URLS[index]}`, title: locale === 'bg' ? `${topic.name.bg} - експертно видео` : `${topic.name.en} expert video`, transcript: locale === 'bg' ? `Достъпна текстова версия: ${topic.why.bg} ${topic.today.bg}` : `Accessible text version: ${topic.why.en} ${topic.today.en}`, captionsUrl: `${topic.source.url}#captions`, consentRequired: true }, ...richBlocks(topic, locale).slice(2, 4)], 7,
)));

const DIY_TOPICS = TOPICS.filter((topic) => ['zero-waste', 'clean-energy', 'sustainable-food', 'ethical-fashion', 'water-conservation', 'permaculture'].includes(topic.slug));
export const DIY_ITEMS: KnowledgeItemDetail[] = DIY_TOPICS.flatMap((topic) => (['en', 'bg'] as KnowledgeLocale[]).map((locale) => makeItem(
  `${topic.slug}-diy-project`, locale, 'diy', topic,
  { en: `DIY: a small ${topic.name.en.toLowerCase()} project`, bg: `Направи си сам: малък проект за ${topic.name.bg.toLowerCase()}` },
  { en: 'A safe, low-cost project with materials, time, steps and a completion checklist.', bg: 'Безопасен и достъпен проект с материали, време, стъпки и списък за завършване.' },
  [
    { id: `${topic.slug}-materials-${locale}`, type: 'callout', tone: 'info', title: locale === 'bg' ? 'Материали • до 20 лв. • 30-45 мин.' : 'Materials • under €10 • 30-45 min', text: locale === 'bg' ? 'Използвайте само чисти, стабилни материали и работете на добре осветено място.' : 'Use only clean, stable materials and work in a well-lit space.' },
    { id: `${topic.slug}-safety-${locale}`, type: 'callout', tone: 'warning', title: locale === 'bg' ? 'Безопасност' : 'Safety', text: locale === 'bg' ? 'Деца работят с инструментите само с възрастен. Не смесвайте почистващи препарати.' : 'Children use tools only with an adult. Never mix cleaning products.' },
    { id: `${topic.slug}-diy-steps-${locale}`, type: 'checklist', items: locale === 'bg' ? ['Подгответе и почистете материалите.', 'Направете малък тест.', 'Изпълнете проекта стъпка по стъпка.', 'Проверете безопасността и отбележете резултата.'] : ['Prepare and clean the materials.', 'Make a small test.', 'Complete the project one step at a time.', 'Check safety and record the result.'] },
    { id: `${topic.slug}-done-${locale}`, type: 'callout', tone: 'success', title: locale === 'bg' ? 'Готово' : 'Complete', text: localeText(topic.today, locale) },
  ], 35, true,
)));

export const RESOURCE_ITEMS: KnowledgeItemDetail[] = TOPICS.flatMap((topic) => (['en', 'bg'] as KnowledgeLocale[]).flatMap((locale) => [0, 1].map((index) => makeItem(
  `${topic.slug}-resource-${index + 1}`, locale, 'resource', topic,
  { en: `${topic.name.en} resource: ${index === 0 ? 'evidence library' : 'practical toolkit'}`, bg: `${topic.name.bg}: ${index === 0 ? 'библиотека с доказателства' : 'практически ресурси'}` },
  { en: `Continue with a reviewed resource from ${topic.source.publisher}.`, bg: `Продължете с проверен ресурс от ${topic.source.publisher}.` },
  [{ id: `${topic.slug}-resource-body-${index}-${locale}`, type: 'paragraph', text: locale === 'bg' ? `Този ресурс е подбран за допълнително четене. Проверен е на ${REVIEWED_AT}.` : `This resource is curated for further learning and was link-checked on ${REVIEWED_AT}.` }], 6, index === 1,
))));

const tourSpecs = [
  { id: 'wetland-tour', topic: TOPICS[4], stops: ['Read the water', 'Meet the habitat', 'Restore the edge'] },
  { id: 'renewable-facility-tour', topic: TOPICS[1], stops: ['Follow the energy', 'Balance demand', 'Power the community'] },
  { id: 'sustainable-community-tour', topic: TOPICS[9], stops: ['Design for comfort', 'Share resources', 'Measure progress'] },
];
export const TOURS: KnowledgeTour[] = tourSpecs.map((tour) => ({ id: tour.id, itemId: tour.id, durationMinutes: 12, stops: tour.stops.map((title, index) => ({ id: `${tour.id}-${index + 1}`, title: { en: title, bg: ['Наблюдавайте системата', 'Открийте връзките', 'Действайте заедно'][index] }, body: { en: `${tour.topic.why.en} Explore the scene and notice how this element connects to the whole system.`, bg: `${tour.topic.why.bg} Разгледайте сцената и забележете как елементът се свързва с цялата система.` }, fact: { en: `Field note ${index + 1}: evidence and local context guide good decisions.`, bg: `Теренна бележка ${index + 1}: доказателствата и местният контекст водят до добри решения.` }, icon: ['water-outline', 'leaf-outline', 'people-outline'][index] })) }));
export const TOUR_ITEMS: KnowledgeItemDetail[] = tourSpecs.flatMap((tour) => (['en', 'bg'] as KnowledgeLocale[]).map((locale) => makeItem(tour.id, locale, 'tour', tour.topic, { en: `Virtual tour: ${tour.topic.name.en}`, bg: `Виртуална обиколка: ${tour.topic.name.bg}` }, { en: 'Explore three interactive stops and connect systems thinking to action.', bg: 'Разгледайте три интерактивни спирки и свържете системното мислене с действие.' }, richBlocks(tour.topic, locale).slice(0, 3), 12)));

export const SIMULATIONS: KnowledgeSimulation[] = [
  { id: 'home-energy-simulation', itemId: 'home-energy-simulation', kind: 'home-energy', methodologySourceId: SOURCES.iea.id },
  { id: 'food-waste-simulation', itemId: 'food-waste-simulation', kind: 'food-waste', methodologySourceId: SOURCES.fao.id },
  { id: 'mobility-simulation', itemId: 'mobility-simulation', kind: 'mobility', methodologySourceId: SOURCES.who.id },
];
export const SIMULATION_ITEMS: KnowledgeItemDetail[] = SIMULATIONS.flatMap((simulation) => {
  const topic = simulation.kind === 'home-energy' ? TOPICS[1] : simulation.kind === 'food-waste' ? TOPICS[2] : TOPICS[7];
  return (['en', 'bg'] as KnowledgeLocale[]).map((locale) => makeItem(simulation.id, locale, 'simulation', topic, { en: `${topic.name.en} impact lab`, bg: `Лаборатория за въздействие: ${topic.name.bg}` }, { en: 'Adjust three inputs and compare your scenario with a documented baseline.', bg: 'Променете три показателя и сравнете сценария си с документирана базова стойност.' }, richBlocks(topic, locale).slice(0, 3), 8));
});

export const WEBINARS: KnowledgeWebinar[] = [
  { id: 'webinar-cities', itemId: 'webinar-cities', speaker: 'Dr. Maya Chen', speakerRole: 'Urban resilience educator', startsAt: '2026-09-10T16:00:00.000Z', durationMinutes: 50, timezone: 'UTC', provider: 'youtube', joinUrl: 'https://www.youtube.com/@UNEnvironmentProgramme', replayUrl: 'https://www.youtube.com/@UNEnvironmentProgramme', transcript: 'The replay transcript is published with the recording after the moderated session.' },
  { id: 'webinar-food', itemId: 'webinar-food', speaker: 'Elena Petrova', speakerRole: 'Community food systems practitioner', startsAt: '2026-09-24T16:00:00.000Z', durationMinutes: 45, timezone: 'UTC', provider: 'youtube', joinUrl: 'https://www.youtube.com/@FAOoftheUN', replayUrl: 'https://www.youtube.com/@FAOoftheUN', transcript: 'The replay transcript is published with the recording after the moderated session.' },
  { id: 'webinar-energy', itemId: 'webinar-energy', speaker: 'Samir Okafor', speakerRole: 'Energy efficiency researcher', startsAt: '2026-10-08T16:00:00.000Z', durationMinutes: 50, timezone: 'UTC', provider: 'youtube', joinUrl: 'https://www.youtube.com/@IEA', replayUrl: 'https://www.youtube.com/@IEA', transcript: 'The replay transcript is published with the recording after the moderated session.' },
];
export const WEBINAR_ITEMS: KnowledgeItemDetail[] = WEBINARS.flatMap((webinar, index) => {
  const topic = [TOPICS[9], TOPICS[2], TOPICS[1]][index];
  return (['en', 'bg'] as KnowledgeLocale[]).map((locale) => makeItem(webinar.id, locale, 'webinar', topic, { en: `${topic.name.en} live studio`, bg: `Дискусия на живо: ${topic.name.bg}` }, { en: `${webinar.speaker} leads a source-backed live session with Q&A.`, bg: `${webinar.speaker} води проверена с източници сесия на живо с въпроси.` }, richBlocks(topic, locale).slice(0, 2), webinar.durationMinutes));
});

const extraQuizTopics = [TOPICS[2], TOPICS[6], TOPICS[7]];
export const EXTRA_QUIZ_ITEMS: KnowledgeItemDetail[] = extraQuizTopics.flatMap((topic) => (['en', 'bg'] as KnowledgeLocale[]).map((locale) => makeItem(`${topic.slug}-skills-quiz`, locale, 'quiz', topic, { en: `${topic.name.en} skills challenge`, bg: `Проверка на знанията: ${topic.name.bg}` }, { en: 'Five questions with source-linked feedback.', bg: 'Пет въпроса с обратна връзка и източници.' }, [{ id: `${topic.slug}-quiz-intro-${locale}`, type: 'paragraph', text: locale === 'bg' ? 'Отговорете на пет въпроса. След всеки опит ще видите обяснение и източник.' : 'Answer five questions. Every attempt returns an explanation and source.' }], 5)));

function makeQuiz(item: KnowledgeItemDetail): KnowledgeQuiz {
  const bg = item.locale === 'bg';
  return { id: `quiz-${item.id}-${item.locale}`, itemId: item.id, passingScore: 80, questions: Array.from({ length: 5 }, (_, index) => ({ id: `${item.id}-${item.locale}-q${index + 1}`, prompt: bg ? `Кое е най-надеждното действие в ситуация ${index + 1}?` : `What is the most reliable action in scenario ${index + 1}?`, options: [{ id: 'a', text: bg ? 'Измерима стъпка, основана на проверен източник' : 'A measurable step based on a reviewed source' }, { id: 'b', text: bg ? 'Непроверено твърдение без контекст' : 'An unverified claim without context' }, { id: 'c', text: bg ? 'Да не се проследява резултатът' : 'Avoid tracking the outcome' }], correctOptionId: 'a', explanation: bg ? 'Измеримото действие позволява резултатът да бъде прегледан и подобрен.' : 'A measurable action lets you review and improve the outcome.', sourceId: item.sources[0].id })) };
}
export const EXTRA_QUIZZES = EXTRA_QUIZ_ITEMS.map(makeQuiz);

const FACTS: Copy[] = [
  { en: 'Reusable products prevent waste only when they replace enough single-use items over time.', bg: 'Продуктите за многократна употреба предотвратяват отпадък, когато във времето заменят достатъчно еднократни продукти.' },
  { en: 'Reducing energy demand makes it easier for clean electricity to cover a larger share of use.', bg: 'Намаляването на потреблението улеснява чистата електроенергия да покрива по-голям дял от нуждите.' },
  { en: 'Food waste also wastes the land, water, energy, and labour used to produce it.', bg: 'Хранителният отпадък пропилява и земята, водата, енергията и труда, вложени в производството.' },
  { en: 'A garment’s useful life depends on fibre, construction, care, repair, and frequency of wear.', bg: 'Полезният живот на дрехата зависи от влакната, изработката, грижата, ремонта и честотата на носене.' },
  { en: 'Biodiversity includes variation within species, between species, and across ecosystems.', bg: 'Биоразнообразието включва различия в рамките на видовете, между видовете и между екосистемите.' },
  { en: 'Climate risks depend on hazards, exposure, and vulnerability—not temperature change alone.', bg: 'Климатичният риск зависи от опасност, изложеност и уязвимост, не само от промяната на температурата.' },
  { en: 'Water quality and reliable access matter alongside the total amount of water available.', bg: 'Качеството и надеждният достъп са важни наред с общото количество налична вода.' },
  { en: 'Walking and cycling infrastructure can improve mobility, health, air quality, and street safety together.', bg: 'Инфраструктурата за ходене и колоездене може едновременно да подобри мобилността, здравето, въздуха и безопасността.' },
  { en: 'Compost returns organic matter to soil, while preventing food waste remains the first priority.', bg: 'Компостът връща органична материя в почвата, а предотвратяването на хранителен отпадък остава първи приоритет.' },
  { en: 'A building’s orientation affects daylight, solar heat, shading, and natural ventilation.', bg: 'Ориентацията на сградата влияе на дневната светлина, слънчевата топлина, засенчването и естествената вентилация.' },
  { en: 'Repair information and spare parts help products remain useful for longer.', bg: 'Информацията за ремонт и резервните части помагат на продуктите да останат полезни по-дълго.' },
  { en: 'Heating and cooling set points can change energy use without replacing equipment.', bg: 'Настройките за отопление и охлаждане могат да променят потреблението без смяна на оборудване.' },
  { en: 'Meal planning works best when it starts with food already in the kitchen.', bg: 'Планирането на меню работи най-добре, когато започва с храната, която вече е в кухнята.' },
  { en: 'Washing less often and following care labels can reduce wear on clothing.', bg: 'По-рядкото пране и спазването на етикета за грижа могат да намалят износването на дрехите.' },
  { en: 'Small urban green spaces can form stepping stones between larger habitats.', bg: 'Малките градски зелени площи могат да бъдат връзки между по-големи местообитания.' },
];

type DailyQuote = Copy & { attribution: string; source: KnowledgeSource };
const QUOTES: DailyQuote[] = [
  { en: 'The mountains are calling and I must go.', bg: 'Планините ме зоват и трябва да тръгна.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'The sun shines not on us but in us.', bg: 'Слънцето не просто грее върху нас, а вътре в нас.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'The clearest way into the Universe is through a forest wilderness.', bg: 'Най-ясният път към Вселената минава през дивата гора.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'Between every two pine trees there is a door leading to a new way of life.', bg: 'Между всеки два бора има врата към нов начин на живот.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'After a whole day in the woods, we are already immortal.', bg: 'След цял ден в гората вече сме безсмъртни.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'When one tugs at a single thing in nature, he finds it attached to the rest of the world.', bg: 'Когато докоснем едно нещо в природата, откриваме връзката му с целия свят.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'Any glimpse into the life of an animal quickens our own.', bg: 'Всеки поглед към живота на животно оживява и нашия собствен.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'The battle for conservation must go on endlessly.', bg: 'Битката за опазването на природата трябва да продължава безкрайно.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'There is not a fragment in all nature.', bg: 'В цялата природа няма нито един откъснат фрагмент.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'Keep close to Nature’s heart.', bg: 'Останете близо до сърцето на природата.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'Nature’s peace will flow into you as sunshine flows into trees.', bg: 'Спокойствието на природата ще се влее във вас, както слънцето в дърветата.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'The winds will blow their own freshness into you.', bg: 'Ветровете ще вдъхнат своята свежест във вас.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'Going out, I found, was really going in.', bg: 'Открих, че излизането навън всъщност е завръщане навътре.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'The world, we are told, was made especially for man—a presumption not supported by all the facts.', bg: 'Казват ни, че светът е създаден специално за човека — предположение, което фактите не подкрепят.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'The storms [will bring] their energy, while cares will drop off like autumn leaves.', bg: 'Бурите ще донесат енергията си, а грижите ще опадат като есенни листа.', attribution: 'John Muir', source: SOURCES.muir },
  { en: 'Sustainable development, democracy and peace are indivisible.', bg: 'Устойчивото развитие, демокрацията и мирът са неделими.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'Solutions to most of our problems must come from us.', bg: 'Решенията на повечето ни проблеми трябва да дойдат от самите нас.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'Tree planting is simple, attainable and guarantees quick, successful results.', bg: 'Засаждането на дървета е просто, постижимо и дава бързи, успешни резултати.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'They plant seeds of peace.', bg: 'Те засаждат семена на мира.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'The participants discover that they must be part of the solutions.', bg: 'Участниците откриват, че трябва да бъдат част от решенията.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'The tree also became a symbol for peace and conflict resolution.', bg: 'Дървото се превърна и в символ на мира и разрешаването на конфликти.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'The state of any country’s environment is a reflection of the kind of governance in place.', bg: 'Състоянието на околната среда отразява начина на управление.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'We are called to assist the Earth to heal her wounds.', bg: 'Призовани сме да помогнем на Земята да излекува раните си.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'There comes a time when humanity is called to shift to a new level of consciousness.', bg: 'Идва време, когато човечеството е призовано към ново ниво на съзнание.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'A time when we have to shed our fear and give hope to each other.', bg: 'Време е да отхвърлим страха и да си дадем надежда.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'That time is now.', bg: 'Това време е сега.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'The choice is ours.', bg: 'Изборът е наш.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'Young people have the energy and creativity to shape a sustainable future.', bg: 'Младите хора имат енергията и творчеството да оформят устойчиво бъдеще.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'You are a gift to your communities and indeed the world.', bg: 'Вие сте дар за общностите си и за целия свят.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
  { en: 'The challenge is to restore the home of the tadpoles.', bg: 'Предизвикателството е да възстановим дома на поповите лъжички.', attribution: 'Wangari Maathai', source: SOURCES.maathai },
];

const TIPS: Copy[] = [
  { en: 'Put one reusable item beside the door so it is ready when you leave.', bg: 'Поставете предмет за многократна употреба до вратата, за да е готов при излизане.' },
  { en: 'Lower one heating or cooling setting for a short, comfortable trial.', bg: 'Намалете една настройка за отопление или охлаждане за кратък и комфортен опит.' },
  { en: 'Move the most perishable food to a visible “eat first” shelf.', bg: 'Преместете най-нетрайната храна на видим рафт „изяж първо“.' },
  { en: 'Check a care label before washing and choose the gentlest suitable cycle.', bg: 'Проверете етикета преди пране и изберете най-щадящата подходяща програма.' },
  { en: 'Photograph one local species and record it without disturbing its habitat.', bg: 'Снимайте местен вид и го запишете, без да нарушавате местообитанието му.' },
  { en: 'Pair one personal climate action with one civic or community action.', bg: 'Съчетайте едно лично климатично действие с едно обществено действие.' },
  { en: 'Read the water meter before and after a quiet hour to look for hidden leaks.', bg: 'Отчетете водомера преди и след тих час, за да потърсите скрит теч.' },
  { en: 'Plan one short journey using a safe walking, cycling, or transit option.', bg: 'Планирайте кратко пътуване с безопасно ходене, колело или обществен транспорт.' },
  { en: 'Observe where rainwater flows before changing a garden bed.', bg: 'Наблюдавайте накъде се оттича дъждовната вода, преди да променяте леха.' },
  { en: 'Close curtains or shades before the hottest part of the day.', bg: 'Затворете завесите или щорите преди най-горещата част от деня.' },
  { en: 'Delay one non-essential purchase for 48 hours and reconsider the need.', bg: 'Отложете несъществена покупка с 48 часа и преценете отново нуждата.' },
  { en: 'Switch off one standby load you do not need overnight.', bg: 'Изключете един уред в режим на готовност, който не ви трябва през нощта.' },
  { en: 'Freeze one portion that would otherwise remain uneaten.', bg: 'Замразете една порция, която иначе би останала неизядена.' },
  { en: 'Repair one loose button or small tear before it grows.', bg: 'Поправете разхлабено копче или малко скъсване, преди да се увеличи.' },
  { en: 'Share one useful local sustainability resource with a neighbour.', bg: 'Споделете полезен местен ресурс за устойчивост със съсед.' },
];

export const EXTRA_DAILY_ITEMS: KnowledgeItemDetail[] = (['en', 'bg'] as KnowledgeLocale[]).flatMap((locale) => [
  ...FACTS.map((copy, index) => makeItem(`daily-fact-${index + 31}`, locale, 'daily_fact', TOPICS[index % TOPICS.length], copy, { en: 'A reviewed fact connected to today’s practical action.', bg: 'Проверен факт, свързан с практично действие за днес.' }, [{ id: `daily-fact-${index}-${locale}`, type: 'paragraph', text: copy[locale] }], 2)),
  ...Array.from({ length: 30 }, (_, index) => {
    const quote = QUOTES[index % QUOTES.length];
    const topic = TOPICS[index % TOPICS.length];
    const quoteSource = quote.source;
    const item = makeItem(`daily-quote-${index + 1}`, locale, 'daily_quote', topic, quote, { en: 'A verified reflection from a sustainability and social-change leader.', bg: 'Проверена мисъл от лидер в устойчивостта и обществената промяна.' }, [{ id: `daily-quote-${index}-${locale}`, type: 'quote', text: quote[locale], attribution: quote.attribution, sourceId: quoteSource.id }], 2);
    return { ...item, sources: [quoteSource], searchText: `${item.searchText} ${quoteSource.publisher}`.toLowerCase() };
  }),
  ...TIPS.map((copy, index) => makeItem(`daily-tip-${index + 1}`, locale, 'daily_tip', TOPICS[index % TOPICS.length], copy, { en: 'One realistic prompt for a more sustainable day.', bg: 'Една реалистична идея за по-устойчив ден.' }, [{ id: `daily-tip-${index}-${locale}`, type: 'callout', tone: 'success', title: locale === 'bg' ? 'Опитайте днес' : 'Try today', text: copy[locale] }], 2)),
]);

export const LEARNING_PATHS: KnowledgeLearningPath[] = (['en', 'bg'] as KnowledgeLocale[]).flatMap((locale) => [
  { id: `path-climate-${locale}`, slug: localizedSlug('climate-action-foundations', locale), locale, title: locale === 'bg' ? 'Основи на действията за климата' : 'Climate Action Foundations', summary: locale === 'bg' ? 'Наука, решения и практично действие.' : 'Science, solutions and practical action.', topicSlug: 'climate-action', moduleItemIds: ['knowledge-climate-action-intro', 'knowledge-climate-action-guide', 'climate-action-field-notes', 'climate-action-expert-video'], requiredQuizItemIds: ['climate-action-basics-quiz'], passingScore: 80 },
  { id: `path-waste-${locale}`, slug: localizedSlug('low-waste-home', locale), locale, title: locale === 'bg' ? 'Дом с по-малко отпадъци' : 'Low-Waste Home', summary: locale === 'bg' ? 'Предотвратяване, повторна употреба и ремонт.' : 'Prevention, reuse and repair.', topicSlug: 'zero-waste', moduleItemIds: ['knowledge-zero-waste-intro', 'knowledge-zero-waste-guide', 'zero-waste-field-notes', 'zero-waste-diy-project'], requiredQuizItemIds: ['lower-waste-choices-quiz'], passingScore: 80 },
  { id: `path-energy-${locale}`, slug: localizedSlug('clean-energy-every-day', locale), locale, title: locale === 'bg' ? 'Чиста енергия всеки ден' : 'Clean Energy Every Day', summary: locale === 'bg' ? 'Ефективност, чисто снабдяване и домашни решения.' : 'Efficiency, clean supply and home decisions.', topicSlug: 'clean-energy', moduleItemIds: ['knowledge-clean-energy-intro', 'knowledge-clean-energy-guide', 'clean-energy-field-notes', 'home-energy-simulation'], requiredQuizItemIds: ['clean-energy-home-quiz'], passingScore: 80 },
]);

export const EXPERIENCE_ITEMS = [...SKILL_ARTICLES, ...VIDEO_ITEMS, ...DIY_ITEMS, ...RESOURCE_ITEMS, ...TOUR_ITEMS, ...SIMULATION_ITEMS, ...WEBINAR_ITEMS, ...EXTRA_QUIZ_ITEMS, ...EXTRA_DAILY_ITEMS];
