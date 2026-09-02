import type { EcosystemBiomeCatalog, EcosystemBiomeId, EcosystemGuest, EcosystemSpecies, EcosystemStage, LocalizedText } from './types';

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

const POWO = (scientificName: string) => `https://powo.science.kew.org/results?q=${encodeURIComponent(scientificName)}`;
const UNLOCKS = [0, 96, 168, 240, 312, 384, 456, 528] as const;

export const SAVANNA_SPECIES: EcosystemSpecies[] = [
  {
    slug: 'umbrella-thorn', scientificName: 'Vachellia tortilis', unlockAt: UNLOCKS[0],
    name: { en: 'Umbrella thorn', bg: 'Чадъровидна акация' },
    shortDescription: { en: 'A thorny tree with a broad, umbrella-shaped crown that casts valuable shade across dry grasslands.', bg: 'Бодливо дърво с широка чадъровидна корона, която дава ценна сянка в сухите тревни пространства.' },
    curiosity: { en: 'Its small leaflets reduce water loss, while its pods provide food for many savanna animals.', bg: 'Дребните листчета ограничават загубата на вода, а шушулките дават храна на много саванни животни.' },
    habitat: { en: 'Dry savannas, bushlands and semi-arid valleys across Africa and southwest Asia.', bg: 'Сухи савани, храсталаци и полупустинни долини в Африка и Югозападна Азия.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Vachellia tortilis'),
  },
  {
    slug: 'african-baobab', scientificName: 'Adansonia digitata', unlockAt: UNLOCKS[1],
    name: { en: 'African baobab', bg: 'Африкански баобаб' },
    shortDescription: { en: 'An unmistakable long-lived tree with a massive trunk adapted to strongly seasonal landscapes.', bg: 'Разпознаваемо дълголетно дърво с масивен ствол, приспособено към силно сезонни местообитания.' },
    curiosity: { en: 'The thick trunk can store large amounts of water, helping the tree through the dry season.', bg: 'Дебелият ствол може да съхранява големи количества вода и помага на дървото през сухия сезон.' },
    habitat: { en: 'Seasonally dry tropical woodland and savanna across much of sub-Saharan Africa.', bg: 'Сезонно сухи тропически гори и савани в голяма част от Субсахарска Африка.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Adansonia digitata'),
  },
  {
    slug: 'marula', scientificName: 'Sclerocarya birrea', unlockAt: UNLOCKS[2],
    name: { en: 'Marula', bg: 'Марула' },
    shortDescription: { en: 'A spreading deciduous savanna tree known for its nutritious yellow fruits.', bg: 'Широко разклонено листопадно саванно дърво, известно с хранителните си жълти плодове.' },
    curiosity: { en: 'Male and female flowers are often carried on separate trees.', bg: 'Мъжките и женските цветове често се развиват на отделни дървета.' },
    habitat: { en: 'Wooded grassland and open woodland in tropical and southern Africa.', bg: 'Горски тревни площи и редки гори в тропическа и южна Африка.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Sclerocarya birrea'),
  },
  {
    slug: 'silver-cluster-leaf', scientificName: 'Terminalia sericea', unlockAt: UNLOCKS[3],
    name: { en: 'Silver cluster-leaf', bg: 'Сребриста терминалия' },
    shortDescription: { en: 'A small savanna tree whose softly hairy leaves can appear silvery in bright light.', bg: 'Малко саванно дърво, чиито меко окосмени листа изглеждат сребристи на силна светлина.' },
    curiosity: { en: 'Its leaves gather near the ends of branches, creating distinctive layered clusters.', bg: 'Листата се събират близо до върховете на клоните и образуват характерни пластове.' },
    habitat: { en: 'Open woodland and sandy savanna in southern and tropical Africa.', bg: 'Редки гори и песъчливи савани в южна и тропическа Африка.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Terminalia sericea'),
  },
  {
    slug: 'red-oat-grass', scientificName: 'Themeda triandra', unlockAt: UNLOCKS[4],
    name: { en: 'Red oat grass', bg: 'Червена овесена трева' },
    shortDescription: { en: 'A tufted perennial grass whose seed heads turn warm red-brown as they mature.', bg: 'Туфеста многогодишна трева, чиито съцветия стават топло червено-кафяви при узряване.' },
    curiosity: { en: 'It is an important native grass across vast seasonally dry landscapes.', bg: 'Тя е важна местна трева в огромни сезонно сухи местообитания.' },
    habitat: { en: 'Seasonally dry tropical grasslands across Africa, Asia and Australia.', bg: 'Сезонно сухи тропически тревни площи в Африка, Азия и Австралия.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Themeda triandra'),
  },
  {
    slug: 'elephant-grass', scientificName: 'Cenchrus purpureus', unlockAt: UNLOCKS[5],
    name: { en: 'Elephant grass', bg: 'Слонска трева' },
    shortDescription: { en: 'A very tall tropical grass that forms dense green clumps in warm, moist places.', bg: 'Много висока тропическа трева, която образува гъсти зелени туфи на топли и влажни места.' },
    curiosity: { en: 'Its towering stems can grow far above a person in favourable conditions.', bg: 'При добри условия високите ѝ стъбла могат да надминат човешки ръст многократно.' },
    habitat: { en: 'Moist savanna margins, riverbanks and disturbed tropical grassland.', bg: 'Влажни краища на савани, речни брегове и нарушени тропически тревни площи.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Cenchrus purpureus'),
  },
  {
    slug: 'devils-thorn', scientificName: 'Tribulus terrestris', unlockAt: UNLOCKS[6],
    name: { en: "Devil's thorn", bg: 'Бабини зъби' },
    shortDescription: { en: 'A low, spreading plant with small yellow flowers and sharply armed fruits.', bg: 'Ниско пълзящо растение с дребни жълти цветове и плодове с твърди бодли.' },
    curiosity: { en: 'Its spiny fruit breaks into pieces that can travel on feet, fur and tyres.', bg: 'Бодливият плод се разделя на части, които могат да се пренасят по крака, козина и гуми.' },
    habitat: { en: 'Open dry ground, tracksides and warm grassland across the Old World.', bg: 'Открити сухи места, край пътеки и топли тревни площи в Стария свят.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Tribulus terrestris'),
  },
  {
    slug: 'african-wild-sage', scientificName: 'Leonotis leonurus', unlockAt: UNLOCKS[7],
    name: { en: 'African wild sage', bg: 'Африканска лъвска опашка' },
    shortDescription: { en: 'A striking shrub with rings of bright orange tubular flowers.', bg: 'Впечатляващ храст с пръстени от яркооранжеви тръбести цветове.' },
    curiosity: { en: 'The flower rings climb the upright stems like a sequence of small orange crowns.', bg: 'Пръстените от цветове се изкачват по изправените стъбла като поредица от оранжеви корони.' },
    habitat: { en: 'Grassland, scrub and forest margins in southern Africa.', bg: 'Тревни площи, храсталаци и горски краища в южна Африка.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Leonotis leonurus'),
  },
];

export const SAVANNA_GUESTS: EcosystemGuest[] = [
  { slug: 'roller', unlockAt: 36, icon: 'musical-notes-outline', name: { en: 'Lilac-breasted roller', bg: 'Люляковогърд валяк' }, message: { en: 'The first branches offer a colourful lookout.', bg: 'Първите клони предлагат цветна наблюдателница.' } },
  { slug: 'giraffe', unlockAt: 108, icon: 'paw-outline', name: { en: 'Giraffe', bg: 'Жираф' }, message: { en: 'Young trees bring new browsing places.', bg: 'Младите дървета създават нови места за паша.' } },
  { slug: 'elephant', unlockAt: 192, icon: 'paw-outline', name: { en: 'African elephant', bg: 'Африкански слон' }, message: { en: 'A layered savanna now supports a great traveller.', bg: 'Разнообразната савана вече поддържа един голям пътешественик.' } },
  { slug: 'savanna-butterfly', unlockAt: 300, icon: 'flower-outline', name: { en: 'Savanna butterfly', bg: 'Саванна пеперуда' }, message: { en: 'More flowers provide nectar and shelter.', bg: 'Повече цветове осигуряват нектар и укритие.' } },
];

export const RAINFOREST_SPECIES: EcosystemSpecies[] = [
  {
    slug: 'kapok-tree', scientificName: 'Ceiba pentandra', unlockAt: UNLOCKS[0],
    name: { en: 'Kapok tree', bg: 'Капоково дърво' },
    shortDescription: { en: 'A towering tropical tree with a buttressed trunk that can rise into the upper canopy.', bg: 'Високо тропическо дърво с дъсковидни корени, което може да достигне горния етаж на гората.' },
    curiosity: { en: 'Its seeds travel inside pods packed with light, silky kapok fibres.', bg: 'Семената му се разпространяват в кутийки, изпълнени с леки копринени влакна.' },
    habitat: { en: 'Tropical forests from Mexico through much of tropical America.', bg: 'Тропически гори от Мексико през голяма част от тропическа Америка.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Ceiba pentandra'),
  },
  {
    slug: 'brazil-nut-tree', scientificName: 'Bertholletia excelsa', unlockAt: UNLOCKS[1],
    name: { en: 'Brazil nut tree', bg: 'Бразилски орех' },
    shortDescription: { en: 'A giant canopy tree of South American wet tropical forests.', bg: 'Гигантско дърво от горния етаж на влажните тропически гори в Южна Америка.' },
    curiosity: { en: 'Its hard round fruits hold the familiar seeds in segments, rather like an orange.', bg: 'Твърдите кръгли плодове съдържат познатите семена в дялове, подобно на портокал.' },
    habitat: { en: 'Wet tropical forest in northern and central South America.', bg: 'Влажни тропически гори в северна и централна Южна Америка.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Bertholletia excelsa'),
  },
  {
    slug: 'cacao-tree', scientificName: 'Theobroma cacao', unlockAt: UNLOCKS[2],
    name: { en: 'Cacao tree', bg: 'Какаово дърво' },
    shortDescription: { en: 'A small evergreen understory tree whose pods contain cacao beans.', bg: 'Малко вечнозелено дърво от долния горски етаж, чиито плодове съдържат какаови зърна.' },
    curiosity: { en: 'Its flowers and fruits can grow directly from the trunk, a trait called cauliflory.', bg: 'Цветовете и плодовете могат да израстват направо от ствола — явление, наречено каулифлория.' },
    habitat: { en: 'Shaded wet tropical forest from Costa Rica to tropical South America.', bg: 'Сенчести влажни тропически гори от Коста Рика до тропическа Южна Америка.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Theobroma cacao'),
  },
  {
    slug: 'rubber-tree', scientificName: 'Hevea brasiliensis', unlockAt: UNLOCKS[3],
    name: { en: 'Rubber tree', bg: 'Каучуково дърво' },
    shortDescription: { en: 'A tall tropical tree whose milky latex is the main natural source of rubber.', bg: 'Високо тропическо дърво, чийто млечен латекс е основният естествен източник на каучук.' },
    curiosity: { en: 'Its ripe three-part fruit can burst and scatter seeds far from the parent tree.', bg: 'Узрелият триделен плод може да се разпука и да разпръсне семената далеч от дървото.' },
    habitat: { en: 'Wet tropical forests of South America, especially the Amazon region.', bg: 'Влажни тропически гори в Южна Америка, особено в района на Амазония.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Hevea brasiliensis'),
  },
  {
    slug: 'acai-palm', scientificName: 'Euterpe oleracea', unlockAt: UNLOCKS[4],
    name: { en: 'Açaí palm', bg: 'Асаи палма' },
    shortDescription: { en: 'A slender, cluster-forming palm of humid lowland forests and floodplains.', bg: 'Стройна палма, образуваща групи във влажни низинни гори и заливни места.' },
    curiosity: { en: 'Its dark purple fruits grow in large hanging clusters beneath the crown.', bg: 'Тъмнолилавите плодове растат в големи висящи гроздове под короната.' },
    habitat: { en: 'Wet lowland forests and river floodplains in northern South America.', bg: 'Влажни низинни гори и речни заливни места в северна Южна Америка.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Euterpe oleracea'),
  },
  {
    slug: 'lobster-claw-heliconia', scientificName: 'Heliconia rostrata', unlockAt: UNLOCKS[5],
    name: { en: 'Lobster-claw heliconia', bg: 'Хеликония „омарова щипка“' },
    shortDescription: { en: 'A bold tropical herb with hanging red-and-yellow flower bracts.', bg: 'Забележително тропическо тревисто растение с висящи червено-жълти прицветници.' },
    curiosity: { en: 'The colourful structures are bracts; the smaller true flowers emerge from inside them.', bg: 'Цветните структури са прицветници, а по-малките истински цветове излизат отвътре.' },
    habitat: { en: 'Humid tropical forest margins in western South America.', bg: 'Влажни тропически горски краища в западна Южна Америка.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Heliconia rostrata'),
  },
  {
    slug: 'vanilla-orchid', scientificName: 'Vanilla planifolia', unlockAt: UNLOCKS[6],
    name: { en: 'Vanilla orchid', bg: 'Ванилова орхидея' },
    shortDescription: { en: 'A climbing tropical orchid with fleshy leaves and fragrant seed pods.', bg: 'Катерлива тропическа орхидея с месести листа и ароматни семенни шушулки.' },
    curiosity: { en: 'It uses aerial roots to cling to trees while keeping its own green leaves in the light.', bg: 'Използва въздушни корени, за да се прикрепя към дървета, докато зелените ѝ листа остават на светлина.' },
    habitat: { en: 'Warm humid forest in Mexico and Central America; widely cultivated in the tropics.', bg: 'Топли влажни гори в Мексико и Централна Америка; широко отглеждана в тропиците.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Vanilla planifolia'),
  },
  {
    slug: 'giant-taro', scientificName: 'Alocasia macrorrhizos', unlockAt: UNLOCKS[7],
    name: { en: 'Giant taro', bg: 'Гигантска алоказия' },
    shortDescription: { en: 'A giant wet-tropical herb with spectacular upward-pointing leaves.', bg: 'Гигантско растение от влажните тропици с впечатляващи изправени листа.' },
    curiosity: { en: 'A single leaf blade can become large enough to shelter many tiny forest creatures from rain.', bg: 'Една листна петура може да стане достатъчно голяма, за да подслони много дребни горски обитатели от дъжда.' },
    habitat: { en: 'Wet tropical places from Malesia to Queensland; now cultivated across the tropics.', bg: 'Влажни тропически места от Малезия до Куинсланд; днес се отглежда из тропиците.' },
    sourceLabel: 'Kew — Plants of the World Online', sourceUrl: POWO('Alocasia macrorrhizos'),
  },
];

export const RAINFOREST_GUESTS: EcosystemGuest[] = [
  { slug: 'tree-frog', unlockAt: 36, icon: 'paw-outline', name: { en: 'Tree frog', bg: 'Дървесна жаба' }, message: { en: 'Broad new leaves hold cool, damp hiding places.', bg: 'Широките нови листа създават прохладни влажни укрития.' } },
  { slug: 'blue-morpho', unlockAt: 108, icon: 'flower-outline', name: { en: 'Blue morpho', bg: 'Син морфо' }, message: { en: 'A flash of blue visits the growing understory.', bg: 'Син проблясък посещава растящия долен горски етаж.' } },
  { slug: 'toucan', unlockAt: 192, icon: 'musical-notes-outline', name: { en: 'Toucan', bg: 'Тукан' }, message: { en: 'Fruit and branches welcome a canopy visitor.', bg: 'Плодовете и клоните посрещат гост от короните.' } },
  { slug: 'sloth', unlockAt: 300, icon: 'paw-outline', name: { en: 'Three-toed sloth', bg: 'Трипръст ленивец' }, message: { en: 'A connected canopy offers a slow, sheltered route.', bg: 'Свързаните корони предлагат бавен и защитен маршрут.' } },
];

export const ECOSYSTEM_BIOMES: EcosystemBiomeCatalog[] = [
  {
    id: 'forest_meadow', icon: 'leaf-outline', species: FOREST_MEADOW_SPECIES, guests: FOREST_MEADOW_GUESTS,
    name: { en: 'Forest & meadow', bg: 'Гора и поляна' },
    eyebrow: { en: 'Temperate nature', bg: 'Умерена природа' },
    description: { en: 'A sunlit meadow gradually becomes a layered woodland edge.', bg: 'Слънчева поляна постепенно се превръща в многопластов горски край.' },
    growthDescription: { en: 'Each unlocked species takes root in the meadow. Over time, your actions turn it into a diverse forest.', bg: 'Всеки отключен вид се вкоренява на поляната. С времето действията ти я превръщат в разнообразна гора.' },
    completionTitle: { en: 'Your meadow has become a living forest edge', bg: 'Твоята поляна се превърна в жив горски край' },
  },
  {
    id: 'savanna', icon: 'sunny-outline', species: SAVANNA_SPECIES, guests: SAVANNA_GUESTS,
    name: { en: 'Savanna', bg: 'Савана' },
    eyebrow: { en: 'Seasonal grassland', bg: 'Сезонни тревни земи' },
    description: { en: 'Open grassland grows into a rich mosaic of grasses, shrubs and shade trees.', bg: 'Откритата тревна земя се развива в богата мозайка от треви, храсти и сенчести дървета.' },
    growthDescription: { en: 'Each species claims a natural place in the open grassland until a diverse savanna takes shape.', bg: 'Всеки вид намира естествено място в откритата земя, докато постепенно се оформя разнообразна савана.' },
    completionTitle: { en: 'Your grassland has become a thriving savanna', bg: 'Тревната ти земя се превърна в жива савана' },
  },
  {
    id: 'rainforest', icon: 'rainy-outline', species: RAINFOREST_SPECIES, guests: RAINFOREST_GUESTS,
    name: { en: 'Tropical rainforest', bg: 'Тропическа гора' },
    eyebrow: { en: 'Layered rainforest', bg: 'Многопластова тропическа гора' },
    description: { en: 'A quiet clearing develops into a humid world of canopy, vines and broad leaves.', bg: 'Тиха горска поляна се развива във влажен свят от корони, лиани и широки листа.' },
    growthDescription: { en: 'New species fill the clearing from the forest floor to the canopy, one layer at a time.', bg: 'Новите видове изпълват пространството от горската почва до короните, пласт по пласт.' },
    completionTitle: { en: 'Your clearing has become a layered rainforest', bg: 'Поляната ти се превърна в многопластова тропическа гора' },
  },
];

export const ALL_ECOSYSTEM_SPECIES = ECOSYSTEM_BIOMES.flatMap((biome) => biome.species);

export function getBiomeCatalog(biome: EcosystemBiomeId = 'forest_meadow'): EcosystemBiomeCatalog {
  return ECOSYSTEM_BIOMES.find((entry) => entry.id === biome) || ECOSYSTEM_BIOMES[0];
}

export function getSpeciesBiome(slug: string): EcosystemBiomeCatalog | null {
  return ECOSYSTEM_BIOMES.find((biome) => biome.species.some((species) => species.slug === slug)) || null;
}
