import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase, { isSupabaseConfigured } from '@/lib/supabase';
import { ECOSYSTEM_BIOMES, getBiomeCatalog, getSpeciesBiome } from './catalog';
import { buildLocalSnapshot, buildSnapshotAtGrowth, normalizeGrowth } from './progression';
import type { EcosystemBiomeId, EcosystemSnapshot, EcosystemSnapshotInput } from './types';

const ACTIVE_SPECIES_KEY = 'green-compass:ecosystem:active-species';
const ACTIVE_BIOME_KEY = 'green-compass:ecosystem:active-biome';
const GROWTH_CACHE_KEY = 'green-compass:ecosystem:last-growth';

function isBiome(value: unknown): value is EcosystemBiomeId {
  return ECOSYSTEM_BIOMES.some((biome) => biome.id === value);
}

function parseServerSnapshot(value: any, preferredBiome?: EcosystemBiomeId): EcosystemSnapshot | null {
  if (!value) return null;
  const rawUnits = Number(value.growth_units ?? value.growthUnits);
  if (!Number.isFinite(rawUnits) || rawUnits < 0) return null;
  const biome = preferredBiome || (isBiome(value.biome) ? value.biome : 'forest_meadow');
  return buildSnapshotAtGrowth(rawUnits, value.active_species_slug ?? value.activeSpeciesSlug, biome, 'server');
}

export const ecosystemService = {
  async getSnapshot({ userId, pointEvents }: EcosystemSnapshotInput): Promise<EcosystemSnapshot> {
    const suffix = userId || 'guest';
    const [savedSpecies, savedBiomeValue, savedGrowth] = await Promise.all([
      AsyncStorage.getItem(`${ACTIVE_SPECIES_KEY}:${suffix}`).catch(() => null),
      AsyncStorage.getItem(`${ACTIVE_BIOME_KEY}:${suffix}`).catch(() => null),
      AsyncStorage.getItem(`${GROWTH_CACHE_KEY}:${suffix}`).catch(() => null),
    ]);
    const savedBiome = isBiome(savedBiomeValue) ? savedBiomeValue : undefined;

    if (userId && isSupabaseConfigured) {
      const { data, error } = await Promise.resolve((supabase as any).rpc('get_my_ecosystem')).catch(() => ({ data: null, error: true }));
      if (!error) {
        const snapshot = parseServerSnapshot(Array.isArray(data) ? data[0] : data, savedBiome);
        if (snapshot) {
          await AsyncStorage.setItem(`${GROWTH_CACHE_KEY}:${suffix}`, String(snapshot.growthUnits)).catch(() => undefined);
          const localSpecies = snapshot.unlockedSpecies.find((species) => species.slug === savedSpecies);
          return localSpecies ? { ...snapshot, activeSpecies: localSpecies } : snapshot;
        }
      }
    }

    const local = buildLocalSnapshot(pointEvents, savedSpecies || undefined, savedBiome);
    // A failed history request can return an empty list. Keep the last known
    // growth for this account while offline; a successful server read wins.
    const growth = Math.max(local.growthUnits, normalizeGrowth(Number(savedGrowth)));
    return buildSnapshotAtGrowth(growth, savedSpecies || undefined, savedBiome);
  },

  async selectSpecies(userId: string | undefined, slug: string, growthUnits: number): Promise<boolean> {
    const biome = getSpeciesBiome(slug);
    const species = biome?.species.find((entry) => entry.slug === slug);
    if (!species || species.unlockAt > normalizeGrowth(growthUnits)) return false;
    const suffix = userId || 'guest';
    await Promise.all([
      AsyncStorage.setItem(`${ACTIVE_SPECIES_KEY}:${suffix}`, slug),
      biome ? AsyncStorage.setItem(`${ACTIVE_BIOME_KEY}:${suffix}`, biome.id) : Promise.resolve(),
    ]);
    if (userId && isSupabaseConfigured) {
      await Promise.resolve((supabase as any).rpc('select_ecosystem_species', { p_species_slug: slug })).catch(() => undefined);
    }
    return true;
  },

  async selectBiome(userId: string | undefined, biome: EcosystemBiomeId): Promise<boolean> {
    const catalog = getBiomeCatalog(biome);
    const suffix = userId || 'guest';
    await Promise.all([
      AsyncStorage.setItem(`${ACTIVE_BIOME_KEY}:${suffix}`, biome),
      AsyncStorage.setItem(`${ACTIVE_SPECIES_KEY}:${suffix}`, catalog.species[0].slug),
    ]);
    if (userId && isSupabaseConfigured) {
      await Promise.resolve((supabase as any).rpc('select_ecosystem_biome', { p_biome: biome })).catch(() => undefined);
    }
    return true;
  },
};
