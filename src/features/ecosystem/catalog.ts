import type { EcosystemGuest, EcosystemSpecies, EcosystemStage, LocalizedText } from './types';

export const STAGE_ORDER: EcosystemStage[] = ['seed', 'sprout', 'young', 'leafy', 'mature'];
export const STAGE_THRESHOLDS = [0, 24, 72, 144, 240] as const;

export const STAGE_LABELS: Record<EcosystemStage, LocalizedText> = {
  seed: { en: 'Seed', bg: 'Семе' },
  sprout: { en: 'Sprout', bg: 'Кълн' },
  young: { en: 'Young plant', bg: 'Младо растение' },
  leafy: { en: 'Leafy plant', bg: 'Разлистено растение' },
  mature: { en: 'Mature plant', bg: 'Зряло растение' },
};

export const FOREST_MEADOW_SPECIES: EcosystemSpecies[] = [
  {
    slug: 'english-oak', scientificName: 'Quercus robur', unlockAt: 0,
    name: { en: 'English oak', bg: 'Летен дъб' },
    shortDescription: { en: 'A long-lived native tree that creates shelter and food for a rich community of life.', bg: 'Дълголетно местно дърво, което дава подслон и храна на богата общност от живи организми.' },
    curiosity: { en: 'Its acorns feed birds and mammals, while old trunks develop valuable hollows.', bg: 'Жълъдите му хранят птици и бозайници, а старите стволове образуват ценни хралупи.' },
    habitat: { en: 'Lowland woods, river valleys and mixed forests across much of Europe.', bg: 'Низинни гори, речни долини и смесени гори в голяма част от Европа.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: 'https://powo.science.kew.org/results?q=Quercus%20robur',
  },
  {
    slug: 'small-leaved-lime', scientificName: 'Tilia cordata', unlockAt: 96,
    name: { en: 'Small-leaved lime', bg: 'Дребнолистна липа' },
    shortDescription: { en: 'A broadleaf forest tree whose fragrant flowers are visited by many pollinators.', bg: 'Широколистно горско дърво, чиито ароматни цветове се посещават от много опрашители.' },
    curiosity: { en: 'The pale bract beside each flower cluster works like a small wing for the fruits.', bg: 'Светлият прицветник до всяко съцветие помага на плодовете да се разнасят като с малко крило.' },
    habitat: { en: 'Mixed deciduous forests and shaded slopes.', bg: 'Смесени широколистни гори и сенчести склонове.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: 'https://powo.science.kew.org/results?q=Tilia%20cordata',
  },
  {
    slug: 'cornelian-cherry', scientificName: 'Cornus mas', unlockAt: 168,
    name: { en: 'Cornelian cherry', bg: 'Дрян' },
    shortDescription: { en: 'A resilient shrub or small tree with early yellow flowers and deep-red ripe fruits.', bg: 'Устойчив храст или малко дърво с ранни жълти цветове и тъмночервени узрели плодове.' },
    curiosity: { en: 'It flowers before its leaves unfold, offering an early seasonal signal in woodland edges.', bg: 'Цъфти преди разлистването си и е един от ранните сезонни сигнали по горските краища.' },
    habitat: { en: 'Warm woodland edges, scrub and rocky slopes.', bg: 'Топли горски краища, храсталаци и каменисти склонове.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: 'https://powo.science.kew.org/results?q=Cornus%20mas',
  },
  {
    slug: 'dog-rose', scientificName: 'Rosa canina', unlockAt: 240,
    name: { en: 'Dog rose', bg: 'Шипка' },
    shortDescription: { en: 'A familiar wild rose with pale flowers and bright hips later in the year.', bg: 'Позната дива роза със светли цветове и ярки шипки по-късно през годината.' },
    curiosity: { en: 'Its dense, arching stems can provide nesting cover for small birds.', bg: 'Гъстите му дъговидни клони могат да дават укритие за гнездене на малки птици.' },
    habitat: { en: 'Hedgerows, scrub, open woods and sunny slopes.', bg: 'Живи плетове, храсталаци, редки гори и слънчеви склонове.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: 'https://powo.science.kew.org/results?q=Rosa%20canina',
  },
  {
    slug: 'yarrow', scientificName: 'Achillea millefolium', unlockAt: 312,
    name: { en: 'Yarrow', bg: 'Бял равнец' },
    shortDescription: { en: 'A meadow perennial with finely divided leaves and many tiny flower heads.', bg: 'Ливадно многогодишно растение с фино нарязани листа и множество дребни цветни кошнички.' },
    curiosity: { en: 'What looks like one flat flower is a gathering of many small flower heads.', bg: 'Това, което изглежда като един плосък цвят, всъщност е събрание от много малки цветни кошнички.' },
    habitat: { en: 'Meadows, roadsides and other open grassy places.', bg: 'Ливади, крайпътни места и други открити тревисти терени.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: 'https://powo.science.kew.org/results?q=Achillea%20millefolium',
  },
  {
    slug: 'red-clover', scientificName: 'Trifolium pratense', unlockAt: 384,
    name: { en: 'Red clover', bg: 'Червена детелина' },
    shortDescription: { en: 'A meadow legume with rounded pink-purple flower heads.', bg: 'Ливадно бобово растение със закръглени розово-лилави съцветия.' },
    curiosity: { en: 'Like other legumes, it partners with bacteria around its roots that can fix nitrogen.', bg: 'Като други бобови растения, образува партньорство с бактерии около корените, които могат да фиксират азот.' },
    habitat: { en: 'Grasslands, meadows, field margins and roadsides.', bg: 'Тревни площи, ливади, краища на ниви и крайпътни места.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: 'https://powo.science.kew.org/results?q=Trifolium%20pratense',
  },
  {
    slug: 'corn-poppy', scientificName: 'Papaver rhoeas', unlockAt: 456,
    name: { en: 'Corn poppy', bg: 'Полски мак' },
    shortDescription: { en: 'A vivid annual wildflower associated with open, disturbed ground and field edges.', bg: 'Ярко едногодишно диво цвете, свързано с открити разровени места и краища на ниви.' },
    curiosity: { en: 'A single capsule can hold a large number of very small seeds.', bg: 'Една семенна кутийка може да съдържа голям брой много дребни семена.' },
    habitat: { en: 'Field margins, fallow ground and open sunny places.', bg: 'Краища на ниви, угари и открити слънчеви места.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: 'https://powo.science.kew.org/results?q=Papaver%20rhoeas',
  },
  {
    slug: 'oxeye-daisy', scientificName: 'Leucanthemum vulgare', unlockAt: 528,
    name: { en: 'Oxeye daisy', bg: 'Обикновена маргаритка' },
    shortDescription: { en: 'A perennial meadow plant with a classic white-and-yellow composite flower head.', bg: 'Многогодишно ливадно растение с познатата бяло-жълта сложна цветна кошничка.' },
    curiosity: { en: 'The yellow centre and white outer rays are different kinds of small flowers sharing one head.', bg: 'Жълтият център и белите външни езичета са различни малки цветове, събрани в една кошничка.' },
    habitat: { en: 'Meadows, grasslands and open roadsides.', bg: 'Ливади, тревни площи и открити крайпътни места.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: 'https://powo.science.kew.org/results?q=Leucanthemum%20vulgare',
  },
];

export const FOREST_MEADOW_GUESTS: EcosystemGuest[] = [
  { slug: 'bumblebee', unlockAt: 36, icon: 'bug-outline', name: { en: 'Bumblebee', bg: 'Земна пчела' }, message: { en: 'Your growing variety has welcomed its first pollinator.', bg: 'Растящото разнообразие привлече първия опрашител.' } },
  { slug: 'songbird', unlockAt: 108, icon: 'musical-notes-outline', name: { en: 'Songbird', bg: 'Пойна птица' }, message: { en: 'More shelter means a song can settle in the garden.', bg: 'Повече укрития означават, че в градината може да се засели песен.' } },
  { slug: 'hedgehog', unlockAt: 192, icon: 'paw-outline', name: { en: 'Hedgehog', bg: 'Таралеж' }, message: { en: 'A mature edge creates a quiet route for a night visitor.', bg: 'Зрелият горски край създава тих маршрут за нощен посетител.' } },
  { slug: 'butterfly', unlockAt: 300, icon: 'flower-outline', name: { en: 'Butterfly', bg: 'Пеперуда' }, message: { en: 'A richer meadow now offers more places to pause and feed.', bg: 'По-богатата поляна вече предлага повече места за почивка и храна.' } },
];
