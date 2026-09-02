import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase, { isSupabaseConfigured } from '@/lib/supabase';
import { ECOSYSTEM_BIOMES, getBiomeCatalog, getSpeciesBiome } from './catalog';
import { buildLocalSnapshot, getEcosystemProgress } from './progression';
import type { EcosystemBiomeId, EcosystemSnapshot, EcosystemSnapshotInput } from './types';

const ACTIVE_SPECIES_KEY = 'green-compass:ecosystem:active-species';
const ACTIVE_BIOME_KEY = 'green-compass:ecosystem:active-biome';

function isBiome(value: unknown): value is EcosystemBiomeId {
  return ECOSYSTEM_BIOMES.some((biome) => biome.id === value);
}

function parseServerSnapshot(value: any, preferredBiome?: EcosystemBiomeId): EcosystemSnapshot | null {
  if (!value) return null;
  const growthUnits = Number(value.growth_units ?? value.growthUnits ?? 0);
  const serverBiome = value.biome;
  const biome = preferredBiome || (isBiome(serverBiome) ? serverBiome : 'forest_meadow');
  const catalog = getBiomeCatalog(biome);
  const speciesSlug = value.active_species_slug ?? value.activeSpeciesSlug;
  const activeSpecies = catalog.species.find((species) => species.slug === speciesSlug) || catalog.species[0];
  return {
    biome,
    activeSpecies,
    unlockedSpecies: catalog.species.filter((species) => species.unlockAt <= growthUnits),
    guests: catalog.guests.filter((guest) => guest.unlockAt <= growthUnits),
    nextGuest: catalog.guests.find((guest) => guest.unlockAt > growthUnits) || null,
    source: 'server',
    ...getEcosystemProgress(growthUnits),
  };
}

export const ecosystemService = {
  async getSnapshot({ userId, pointEvents }: EcosystemSnapshotInput): Promise<EcosystemSnapshot> {
    const suffix = userId || 'guest';
    const [savedSpecies, savedBiomeValue] = await Promise.all([
      AsyncStorage.getItem(`${ACTIVE_SPECIES_KEY}:${suffix}`).catch(() => null),
      AsyncStorage.getItem(`${ACTIVE_BIOME_KEY}:${suffix}`).catch(() => null),
    ]);
    const savedBiome = isBiome(savedBiomeValue) ? savedBiomeValue : undefined;

    if (userId && isSupabaseConfigured) {
      const { data, error } = await (supabase as any).rpc('get_my_ecosystem');
      if (!error) {
        const snapshot = parseServerSnapshot(Array.isArray(data) ? data[0] : data, savedBiome);
        if (snapshot) {
          const localSpecies = snapshot.unlockedSpecies.find((species) => species.slug === savedSpecies);
          return localSpecies ? { ...snapshot, activeSpecies: localSpecies } : snapshot;
        }
      }
    }

    return buildLocalSnapshot(pointEvents, savedSpecies || undefined, savedBiome);
  },

  async selectSpecies(userId: string | undefined, slug: string, growthUnits: number): Promise<boolean> {
    const biome = getSpeciesBiome(slug);
    const species = biome?.species.find((entry) => entry.slug === slug);
    if (!species || species.unlockAt > growthUnits) return false;
    const suffix = userId || 'guest';
    await Promise.all([
      AsyncStorage.setItem(`${ACTIVE_SPECIES_KEY}:${suffix}`, slug),
      biome ? AsyncStorage.setItem(`${ACTIVE_BIOME_KEY}:${suffix}`, biome.id) : Promise.resolve(),
    ]);
    if (userId && isSupabaseConfigured) {
      await (supabase as any).rpc('select_ecosystem_species', { p_species_slug: slug });
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
      await (supabase as any).rpc('select_ecosystem_biome', { p_biome: biome });
    }
    return true;
  },
};
