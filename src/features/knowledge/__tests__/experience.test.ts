import fs from 'fs';
import path from 'path';
import { ALL_DAILY_DOSES, KNOWLEDGE_ITEMS, KNOWLEDGE_TOPICS } from '../data/catalog';
import { LEARNING_PATHS, SIMULATIONS, TOURS, WEBINARS } from '../data/experienceCatalog';
import { knowledgeService } from '../service';
import { validateKnowledgeTopicVisual } from '../validation';
import { KNOWLEDGE_ILLUSTRATIONS, resolveKnowledgeVisual } from '../visuals';

jest.mock('@/lib/supabase', () => ({ __esModule: true, default: { from: jest.fn(), rpc: jest.fn() } }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  },
}));

describe('Knowledge Hub complete launch experience', () => {
  it.each(['en', 'bg'] as const)('ships the complete %s catalog', (locale) => {
    const items = KNOWLEDGE_ITEMS.filter((item) => item.locale === locale);
    expect(items.filter((item) => item.type === 'article' || item.type === 'guide')).toHaveLength(30);
    expect(items.filter((item) => item.type === 'video')).toHaveLength(10);
    expect(items.filter((item) => item.type === 'diy')).toHaveLength(6);
    expect(items.filter((item) => item.type === 'resource')).toHaveLength(20);
    expect(items.filter((item) => item.type === 'tour')).toHaveLength(3);
    expect(items.filter((item) => item.type === 'simulation')).toHaveLength(3);
    expect(items.filter((item) => item.type === 'webinar')).toHaveLength(3);
    expect(items.filter((item) => item.type === 'quiz')).toHaveLength(6);
    expect(ALL_DAILY_DOSES.filter((item) => item.locale === locale)).toHaveLength(90);
    expect(new Set(ALL_DAILY_DOSES.filter((item) => item.locale === locale).map((item) => item.title)).size).toBe(90);
    expect(LEARNING_PATHS.filter((entry) => entry.locale === locale)).toHaveLength(3);
  });

  it('provides three complete tours, simulations and webinars', () => {
    expect(TOURS).toHaveLength(3);
    expect(TOURS.every((tour) => tour.stops.length >= 3)).toBe(true);
    expect(SIMULATIONS).toHaveLength(3);
    expect(WEBINARS).toHaveLength(3);
    expect(WEBINARS.every((entry) => entry.joinUrl.startsWith('https://') && Boolean(entry.transcript))).toBe(true);
  });

  it('keeps all ten topic illustrations accessible and under budget', () => {
    expect(KNOWLEDGE_TOPICS).toHaveLength(10);
    for (const topic of KNOWLEDGE_TOPICS) {
      expect(validateKnowledgeTopicVisual(topic)).toEqual([]);
      const asset = path.join(process.cwd(), 'assets', 'images', 'knowledge', `${topic.visual.illustrationKey}.webp`);
      expect(fs.existsSync(asset)).toBe(true);
      expect(fs.statSync(asset).size).toBeLessThanOrEqual(250 * 1024);
    }
  });

  it('falls back to the topic scene when item media is missing', () => {
    const result = resolveKnowledgeVisual({ topicSlugs: ['zero-waste'], visual: { illustrationKey: 'missing-media' } }, KNOWLEDGE_TOPICS);
    expect(result.source).toBe(KNOWLEDGE_ILLUSTRATIONS['zero-waste']);
    expect(result.visual.palette.foreground).toBe('#FFFFFF');
  });

  it('keeps the daily schedule stable for a date and respects topic preferences', () => {
    const date = new Date('2026-08-19T19:00:00.000Z');
    const first = knowledgeService.getDailyHistory('en', 7, ['clean-energy'], date);
    const second = knowledgeService.getDailyHistory('en', 7, ['clean-energy'], date);
    expect(first).toEqual(second);
    expect(first.every(({ item }) => item.topicSlugs.includes('clean-energy'))).toBe(true);
  });

  it('ships six readable bilingual toolkit PDFs', () => {
    const directory = path.join(process.cwd(), 'output', 'pdf');
    const files = fs.readdirSync(directory).filter((file) => file.endsWith('.pdf'));
    expect(files).toHaveLength(6);
    expect(files.every((file) => fs.statSync(path.join(directory, file)).size > 10_000)).toBe(true);
  });

  it('calculates bounded, explainable simulation outcomes', () => {
    const energy = knowledgeService.runSimulation('home-energy-simulation', { primary: 100, secondary: 25, tertiary: 20 });
    expect(energy.score).toBe(60);
    expect(energy.improvementPercent).toBe(40);
    const mobility = knowledgeService.runSimulation('mobility-simulation', { primary: 100, secondary: 40, tertiary: 30 });
    expect(mobility.score).toBe(39);
    expect(mobility.improvementPercent).toBe(61);
  });
});
