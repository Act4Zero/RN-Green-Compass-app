import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '@/lib/supabase';
import { ecosystemService } from '../service';

jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn(), setItem: jest.fn() }));
jest.mock('@/lib/supabase', () => ({ __esModule: true, default: { rpc: jest.fn() }, isSupabaseConfigured: true }));
const values = new Map<string, string>();
const rpc = supabase.rpc as jest.Mock;
beforeEach(() => {
  values.clear(); rpc.mockReset();
  (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => values.get(key) ?? null);
  (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key: string, value: string) => { values.set(key, value); });
});

it('accepts a PromiseLike RPC and prevents a locked active species from rendering', async () => {
  rpc.mockReturnValue({ then: (resolve: (value: unknown) => void) => resolve({ data: { growth_units: 96, active_species_slug: 'oxeye-daisy', biome: 'forest_meadow' }, error: null }) });
  const snapshot = await ecosystemService.getSnapshot({ userId: 'one', pointEvents: [] });
  expect(snapshot.activeSpecies.slug).toBe('english-oak');
  expect(snapshot.growthUnits).toBe(96);
});

it('preserves cached growth on a network failure without leaking progress between users', async () => {
  rpc.mockResolvedValueOnce({ data: { growth_units: 528, biome: 'forest_meadow' }, error: null });
  await ecosystemService.getSnapshot({ userId: 'one', pointEvents: [] });
  rpc.mockRejectedValue(new Error('offline'));
  expect((await ecosystemService.getSnapshot({ userId: 'one', pointEvents: [] })).growthUnits).toBe(528);
  expect((await ecosystemService.getSnapshot({ userId: 'two', pointEvents: [] })).growthUnits).toBe(0);
  expect((await ecosystemService.getSnapshot({ pointEvents: [] })).growthUnits).toBe(0);
});

it('keeps a locally saved biome and species when the sync request is unavailable', async () => {
  rpc.mockRejectedValue(new Error('offline'));
  expect(await ecosystemService.selectSpecies('one', 'african-baobab', 96)).toBe(true);
  expect(await ecosystemService.selectSpecies('one', 'oxeye-daisy', 96)).toBe(false);
  expect(values.get('green-compass:ecosystem:active-biome:one')).toBe('savanna');
});
