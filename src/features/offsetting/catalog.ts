import type { CarbonActivityFactor, DailyEcoChallenge, EmissionFactor, FootprintBenchmark, ImpactCategory, ImpactEquivalency, LearningStage, OffsetProject, PersonalizedCarbonTip, SustainabilityPoll } from './types';

export const FACTOR_VERSION = 'DESNZ-2026-JULY-v1';
export const FACTOR_SOURCE_URL = 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026';
export const UK_ELECTRICITY_KG_CO2E_PER_KWH = 0.18436;
export const EDGAR_BENCHMARK_SOURCE_URL = 'https://edgar.jrc.ec.europa.eu/report_2025?vis=ghgpop';
export const EPA_EQUIVALENCY_SOURCE_URL = 'https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references';

// Reviewed July 2026 flat-file factors. Each value combines the direct factor
// and its matching well-to-tank factor. Flight includes radiative forcing; car
// uses average unknown fuel per vehicle-km and is divided by occupancy.
export const TRAVEL_FACTORS: Record<string, EmissionFactor> = {
  plane: { code: 'plane', version: FACTOR_VERSION, label: 'Short-haul average passenger, RF + WTT', kgCo2ePerPassengerKm: 0.15072, sourceLabel: 'UK Government GHG Conversion Factors 2026', sourceUrl: FACTOR_SOURCE_URL },
  train: { code: 'train', version: FACTOR_VERSION, label: 'National rail + WTT', kgCo2ePerPassengerKm: 0.03989, sourceLabel: 'UK Government GHG Conversion Factors 2026', sourceUrl: FACTOR_SOURCE_URL },
  bus: { code: 'bus', version: FACTOR_VERSION, label: 'Average local bus + WTT', kgCo2ePerPassengerKm: 0.128, sourceLabel: 'UK Government GHG Conversion Factors 2026', sourceUrl: FACTOR_SOURCE_URL },
  boat: { code: 'boat', version: FACTOR_VERSION, label: 'Average ferry passenger + WTT', kgCo2ePerPassengerKm: 0.13825, sourceLabel: 'UK Government GHG Conversion Factors 2026', sourceUrl: FACTOR_SOURCE_URL },
  car: { code: 'car', version: FACTOR_VERSION, label: 'Average car, unknown fuel + WTT', kgCo2ePerPassengerKm: 0.2099, sourceLabel: 'UK Government GHG Conversion Factors 2026', sourceUrl: FACTOR_SOURCE_URL },
};

export const ACTIVITY_FACTORS: CarbonActivityFactor[] = [
  { code: 'car-km', activity: 'transport', label: 'Average car journey', unit: 'km', regionCode: 'GB', kgCo2ePerUnit: 0.2099, version: FACTOR_VERSION, methodology: 'Average unknown-fuel car, direct plus well-to-tank, per vehicle kilometre.', sourceLabel: 'UK Government GHG Conversion Factors 2026', sourceUrl: FACTOR_SOURCE_URL },
  { code: 'bus-passenger-km', activity: 'transport', label: 'Local bus journey', unit: 'passenger km', regionCode: 'GB', kgCo2ePerUnit: 0.128, version: FACTOR_VERSION, methodology: 'Average local bus, direct plus well-to-tank, per passenger kilometre.', sourceLabel: 'UK Government GHG Conversion Factors 2026', sourceUrl: FACTOR_SOURCE_URL },
  { code: 'train-passenger-km', activity: 'transport', label: 'National rail journey', unit: 'passenger km', regionCode: 'GB', kgCo2ePerUnit: 0.03989, version: FACTOR_VERSION, methodology: 'National rail, direct plus well-to-tank, per passenger kilometre.', sourceLabel: 'UK Government GHG Conversion Factors 2026', sourceUrl: FACTOR_SOURCE_URL },
  { code: 'electricity-uk-kwh', activity: 'electricity', label: 'UK grid electricity', unit: 'kWh', regionCode: 'GB', kgCo2ePerUnit: UK_ELECTRICITY_KG_CO2E_PER_KWH, version: FACTOR_VERSION, methodology: 'Generation, transmission and distribution, and well-to-tank components.', sourceLabel: 'UK Government GHG Conversion Factors 2026', sourceUrl: FACTOR_SOURCE_URL },
  { code: 'natural-gas-kwh', activity: 'heating', label: 'Natural gas heating', unit: 'kWh', regionCode: 'GB', kgCo2ePerUnit: 0.20269, version: FACTOR_VERSION, methodology: 'Natural gas gross calorific value, direct plus well-to-tank estimate.', sourceLabel: 'UK Government GHG Conversion Factors 2026', sourceUrl: FACTOR_SOURCE_URL },
  { code: 'heating-oil-kwh', activity: 'heating', label: 'Heating oil', unit: 'kWh', regionCode: 'GB', kgCo2ePerUnit: 0.29877, version: FACTOR_VERSION, methodology: 'Burning oil energy estimate including upstream emissions.', sourceLabel: 'UK Government GHG Conversion Factors 2026', sourceUrl: FACTOR_SOURCE_URL },
  { code: 'beef-meal', activity: 'food', label: 'Beef-based meal estimate', unit: 'meal', regionCode: 'GLOBAL', kgCo2ePerUnit: 5, version: 'GC-FOOD-2026-v1', methodology: 'Directional meal template for personal learning; not an inventory-grade food lifecycle assessment.', sourceLabel: 'Green Compass reviewed learning estimate', sourceUrl: FACTOR_SOURCE_URL },
  { code: 'plant-meal', activity: 'food', label: 'Plant-forward meal estimate', unit: 'meal', regionCode: 'GLOBAL', kgCo2ePerUnit: 0.8, version: 'GC-FOOD-2026-v1', methodology: 'Directional meal template for personal learning; not an inventory-grade food lifecycle assessment.', sourceLabel: 'Green Compass reviewed learning estimate', sourceUrl: FACTOR_SOURCE_URL },
  { code: 'new-clothing-item', activity: 'purchases', label: 'New clothing item estimate', unit: 'item', regionCode: 'GLOBAL', kgCo2ePerUnit: 12, version: 'GC-CONSUMPTION-2026-v1', methodology: 'Directional consumption template; product-specific footprints vary substantially.', sourceLabel: 'Green Compass reviewed learning estimate', sourceUrl: FACTOR_SOURCE_URL },
  { code: 'reused-clothing-item', activity: 'purchases', label: 'Reused clothing item estimate', unit: 'item', regionCode: 'GLOBAL', kgCo2ePerUnit: 1, version: 'GC-CONSUMPTION-2026-v1', methodology: 'Directional estimate for acquisition and handling of a reused item.', sourceLabel: 'Green Compass reviewed learning estimate', sourceUrl: FACTOR_SOURCE_URL },
  { code: 'landfill-waste-kg', activity: 'waste', label: 'Mixed waste sent to landfill', unit: 'kg', regionCode: 'GB', kgCo2ePerUnit: 0.467, version: 'GC-WASTE-2026-v1', methodology: 'Directional mixed-waste template; composition and treatment route materially affect the result.', sourceLabel: 'Green Compass reviewed learning estimate', sourceUrl: FACTOR_SOURCE_URL },
  { code: 'recycled-waste-kg', activity: 'waste', label: 'Material sent for recycling', unit: 'kg', regionCode: 'GB', kgCo2ePerUnit: 0.021, version: 'GC-WASTE-2026-v1', methodology: 'Directional mixed recycling template; material-specific factors should be preferred when available.', sourceLabel: 'Green Compass reviewed learning estimate', sourceUrl: FACTOR_SOURCE_URL },
];

export const FOOTPRINT_BENCHMARKS: FootprintBenchmark[] = [
  { regionCode: 'GLOBAL', regionName: 'Global', year: 2024, tonnesCo2ePerCapita: 6.56, scope: 'territorial_ghg_excluding_lulucf', version: 'EDGAR-2025-GHG', sourceLabel: 'EDGAR 2025 report', sourceUrl: EDGAR_BENCHMARK_SOURCE_URL },
  { regionCode: 'BG', regionName: 'Bulgaria', year: 2024, tonnesCo2ePerCapita: 6.92, scope: 'territorial_ghg_excluding_lulucf', version: 'EDGAR-2025-GHG', sourceLabel: 'EDGAR 2025 report', sourceUrl: EDGAR_BENCHMARK_SOURCE_URL },
  { regionCode: 'GB', regionName: 'United Kingdom', year: 2024, tonnesCo2ePerCapita: 5.63, scope: 'territorial_ghg_excluding_lulucf', version: 'EDGAR-2025-GHG', sourceLabel: 'EDGAR 2025 report', sourceUrl: EDGAR_BENCHMARK_SOURCE_URL },
  { regionCode: 'US', regionName: 'United States', year: 2024, tonnesCo2ePerCapita: 17.34, scope: 'territorial_ghg_excluding_lulucf', version: 'EDGAR-2025-GHG', sourceLabel: 'EDGAR 2025 report', sourceUrl: EDGAR_BENCHMARK_SOURCE_URL },
  { regionCode: 'DE', regionName: 'Germany', year: 2024, tonnesCo2ePerCapita: 8.17, scope: 'territorial_ghg_excluding_lulucf', version: 'EDGAR-2025-GHG', sourceLabel: 'EDGAR 2025 report', sourceUrl: EDGAR_BENCHMARK_SOURCE_URL },
];

export const IMPACT_EQUIVALENCIES: ImpactEquivalency[] = [
  { code: 'urban-tree-seedling-10-years', version: 'EPA-2024-v1', label: 'urban tree seedlings grown for 10 years (annual sequestration equivalent)', kgCo2ePerUnit: 60, methodology: 'Approximate probability-weighted annual sequestration after the EPA growth and survival assumptions. This is not a tree-planting claim.', sourceLabel: 'US EPA Greenhouse Gas Equivalencies Calculator', sourceUrl: EPA_EQUIVALENCY_SOURCE_URL },
];

export const OFFSET_PROJECTS: OffsetProject[] = [
  { id: 'cloverly-forest-restoration', provider: 'cloverly', providerProjectId: 'forest-restoration', name: 'Verified forest restoration portfolio', summary: 'A reviewed placeholder catalog entry for Cloverly sandbox checkout. Production metadata is refreshed from the provider before activation.', country: 'Multiple regions', technology: 'Afforestation and forest restoration', standard: 'Provider-verified registry credits', registryUrl: 'https://cloverly.com/', permanence: 'Project-specific; inspect the registry record before checkout.', pricePerTonneMinor: 2200, currency: 'USD', active: true },
  { id: 'cloverly-renewable-energy', provider: 'cloverly', providerProjectId: 'renewable-energy', name: 'Verified renewable energy portfolio', summary: 'A reviewed placeholder catalog entry for Cloverly sandbox checkout. Production inventory and certification remain provider-authoritative.', country: 'Multiple regions', technology: 'Renewable energy', standard: 'Provider-verified registry credits', registryUrl: 'https://cloverly.com/', permanence: 'Avoidance credit; project-specific documentation applies.', pricePerTonneMinor: 1800, currency: 'USD', active: true },
];

export const PERSONALIZED_CARBON_TIPS: PersonalizedCarbonTip[] = [
  { id: 'tip-plant-meal', category: 'food', title: 'Try one plant-forward meal', description: 'Swap one beef-based meal for the plant-forward template and log the comparison.', expectedImpact: 'About 4.2 kg CO₂e avoided per compared meal', assumption: 'Uses Green Compass directional meal templates; recipes and supply chains vary.', knowledgeSlug: 'sustainable-food-starter-guide' },
  { id: 'tip-train-km', category: 'transport', title: 'Compare rail for a suitable trip', description: 'Use the travel comparison before a journey and choose rail when practical.', expectedImpact: 'About 0.17 kg CO₂e less per km than a solo average car', assumption: 'Uses UK 2026 average car and national rail factors.', knowledgeSlug: 'green-transportation-starter-guide' },
  { id: 'tip-reuse-item', category: 'purchases', title: 'Choose one reused item first', description: 'Search second-hand before buying one new clothing item.', expectedImpact: 'Directional difference of about 11 kg CO₂e per template item', assumption: 'Product footprints vary widely; this is a learning estimate.', knowledgeSlug: 'ethical-fashion-starter-guide' },
  { id: 'tip-recycle-waste', category: 'waste', title: 'Separate one kilogram of recyclable material', description: 'Log the material with an explicit landfill comparison.', expectedImpact: 'Directional difference of about 0.45 kg CO₂e per kg', assumption: 'Material mix and local treatment route change the result.', knowledgeSlug: 'zero-waste-starter-guide' },
  { id: 'tip-electricity-kwh', category: 'electricity', title: 'Measure one avoidable electricity load', description: 'Use a bill or smart plug to find kWh that can be removed safely.', expectedImpact: '0.184 kg CO₂e per UK-grid kWh not consumed', assumption: 'Uses the disclosed UK grid factor; regional electricity differs.', knowledgeSlug: 'clean-energy-starter-guide' },
  { id: 'tip-heating-kwh', category: 'heating', title: 'Reduce a measured heating load', description: 'Track kWh before and after one safe efficiency change.', expectedImpact: 'About 0.20 kg CO₂e per natural-gas kWh avoided', assumption: 'Uses the UK natural-gas template and excludes building-specific effects.', knowledgeSlug: 'clean-energy-starter-guide' },
];

const categoryKnowledge: Record<ImpactCategory, string> = {
  plastic: 'zero-waste-starter-guide',
  food: 'sustainable-food-starter-guide',
  energy: 'clean-energy-starter-guide',
  mobility: 'green-transportation-starter-guide',
  water: 'water-conservation-starter-guide',
  reuse: 'ethical-fashion-starter-guide',
};

const challengeSeed: Record<ImpactCategory, Record<LearningStage, [string, string, Partial<DailyEcoChallenge['impact']>][]>> = {
  plastic: {
    beginner: [['Carry a reusable bottle', 'Skip one single-use drink bottle today.', { plasticItemsAvoided: 1 }], ['Refuse one plastic bag', 'Bring a reusable bag for one purchase.', { plasticItemsAvoided: 1 }]],
    intermediate: [['Pack a plastic-free lunch', 'Avoid disposable wrap, cutlery, and bottles for one meal.', { plasticItemsAvoided: 4 }], ['Audit your bathroom plastics', 'Identify one packaged product to replace when it runs out.', { plasticItemsAvoided: 1 }]],
    advanced: [['Choose a refill purchase', 'Buy one staple from a refill or package-free source.', { plasticItemsAvoided: 3 }]],
  },
  food: {
    beginner: [['Plan one plant-forward meal', 'Make one meal today centered on plants.', { co2eKgAvoided: 0.8 }], ['Save one serving', 'Store or freeze one serving before it becomes waste.', { wasteKgAvoided: 0.25 }]],
    intermediate: [['Use the eat-first shelf', 'Build a meal around food that needs using soon.', { wasteKgAvoided: 0.4 }], ['Choose seasonal produce', 'Pick one locally seasonal fruit or vegetable.', { co2eKgAvoided: 0.3 }]],
    advanced: [['Run a zero-waste dinner', 'Use scraps and leftovers so the meal creates no edible waste.', { wasteKgAvoided: 0.7 }]],
  },
  energy: {
    beginner: [['Switch off standby power', 'Unplug one unused device or use a switched power strip.', { co2eKgAvoided: 0.1 }], ['Use daylight first', 'Keep lights off for one daylight hour.', { co2eKgAvoided: 0.05 }]],
    intermediate: [['Lower heating or cooling', 'Adjust the thermostat by one degree for today.', { co2eKgAvoided: 0.6 }], ['Wash clothes cooler', 'Run one suitable load at 30°C or cold.', { co2eKgAvoided: 0.4 }]],
    advanced: [['Measure an energy hotspot', 'Use a meter or bill data to find your highest avoidable load.', { co2eKgAvoided: 0.5 }]],
  },
  mobility: {
    beginner: [['Walk one short trip', 'Replace one short car trip with walking.', { co2eKgAvoided: 0.5 }], ['Combine two errands', 'Plan one route that avoids a separate journey.', { co2eKgAvoided: 0.7 }]],
    intermediate: [['Use public transport today', 'Replace one suitable car journey with bus or train.', { co2eKgAvoided: 1.2 }], ['Share a car journey', 'Ride with another person instead of taking two cars.', { co2eKgAvoided: 1 }]],
    advanced: [['Plan a low-carbon route', 'Compare modes and choose the lowest practical option for a future trip.', { co2eKgAvoided: 2 }]],
  },
  water: {
    beginner: [['Take a shorter shower', 'Reduce one shower by two minutes.', { waterLitresSaved: 20 }], ['Turn off the tap', 'Keep the tap off while brushing your teeth.', { waterLitresSaved: 8 }]],
    intermediate: [['Run only a full load', 'Wait for a full dishwasher or laundry load.', { waterLitresSaved: 15 }], ['Reuse rinse water', 'Reuse safe rinse water for plants or cleaning.', { waterLitresSaved: 5 }]],
    advanced: [['Check for a silent leak', 'Inspect a toilet or tap and arrange a fix if needed.', { waterLitresSaved: 30 }]],
  },
  reuse: {
    beginner: [['Repair before replacing', 'Spend ten minutes assessing or fixing one item.', { wasteKgAvoided: 0.2 }], ['Use what you already own', 'Borrow or reuse instead of buying one new item.', { wasteKgAvoided: 0.3 }]],
    intermediate: [['List one item for reuse', 'Donate, swap, or sell one useful item.', { wasteKgAvoided: 0.8 }], ['Choose second-hand first', 'Search second-hand before one planned purchase.', { wasteKgAvoided: 0.5 }]],
    advanced: [['Host a mini swap', 'Invite someone to exchange an item, book, or tool.', { wasteKgAvoided: 1.5 }]],
  },
};

export const DAILY_CHALLENGES: DailyEcoChallenge[] = Object.entries(challengeSeed).flatMap(([category, stages]) =>
  Object.entries(stages).flatMap(([difficulty, challenges]) =>
    challenges.map(([title, description, impact], index) => ({
      id: `${category}-${difficulty}-${index + 1}`,
      slug: `${category}-${difficulty}-${index + 1}`,
      title,
      description,
      category: category as ImpactCategory,
      difficulty: difficulty as LearningStage,
      impact,
      knowledgeSlug: categoryKnowledge[category as ImpactCategory],
      points: 5,
      active: true,
    })),
  ),
);

export const DAILY_POLLS: SustainabilityPoll[] = [
  { id: 'poll-hardest-habit', slug: 'hardest-habit', question: 'Which habit feels hardest to change right now?', options: [{ id: 'travel', label: 'Travel' }, { id: 'food', label: 'Food' }, { id: 'energy', label: 'Home energy' }, { id: 'waste', label: 'Waste' }] },
  { id: 'poll-next-focus', slug: 'next-focus', question: 'Where would one small change feel most achievable?', options: [{ id: 'plastic', label: 'Less plastic' }, { id: 'water', label: 'Save water' }, { id: 'reuse', label: 'Reuse more' }, { id: 'mobility', label: 'Greener travel' }] },
  { id: 'poll-motivation', slug: 'motivation', question: 'What keeps you motivated to act sustainably?', options: [{ id: 'nature', label: 'Protecting nature' }, { id: 'health', label: 'Health' }, { id: 'saving', label: 'Saving money' }, { id: 'community', label: 'Community' }] },
  { id: 'poll-learning', slug: 'learning', question: 'How do you prefer to learn a new sustainable habit?', options: [{ id: 'quick-tip', label: 'Quick tip' }, { id: 'guide', label: 'Step-by-step guide' }, { id: 'quiz', label: 'Quiz' }, { id: 'challenge', label: 'Try a challenge' }] },
  { id: 'poll-progress', slug: 'progress', question: 'Which progress signal is most useful to you?', options: [{ id: 'co2e', label: 'CO₂e avoided' }, { id: 'streak', label: 'Streak' }, { id: 'actions', label: 'Actions completed' }, { id: 'community', label: 'Community impact' }] },
  { id: 'poll-transport', slug: 'transport', question: 'Which lower-impact travel option could you use more?', options: [{ id: 'walk', label: 'Walking' }, { id: 'bike', label: 'Cycling' }, { id: 'bus', label: 'Bus' }, { id: 'train', label: 'Train' }] },
  { id: 'poll-gratitude', slug: 'gratitude', question: 'Which part of nature lifted your day?', options: [{ id: 'air', label: 'Fresh air' }, { id: 'green', label: 'Green space' }, { id: 'water', label: 'Water' }, { id: 'wildlife', label: 'Wildlife' }] },
];

export const INTEREST_CATEGORY_MAP: Record<string, ImpactCategory[]> = {
  'Zero Waste': ['plastic', 'reuse'],
  'Clean Energy': ['energy'],
  'Sustainable Food': ['food'],
  'Ethical Fashion': ['reuse'],
  Conservation: ['water', 'reuse'],
  'Climate Action': ['energy', 'mobility'],
  'Water Conservation': ['water'],
  'Green Transportation': ['mobility'],
  Permaculture: ['food', 'water'],
  'Sustainable Building': ['energy', 'reuse'],
};
