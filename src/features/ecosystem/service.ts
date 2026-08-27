import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase, { isSupabaseConfigured } from '@/lib/supabase';
import { FOREST_MEADOW_GUESTS, FOREST_MEADOW_SPECIES } from './catalog';
import { buildLocalSnapshot, getEcosystemProgress } from './progression';
import type { EcosystemSnapshot, EcosystemSnapshotInput } from './types';

const ACTIVE_SPECIES_KEY = 'green-compass:ecosystem:active-species';

function parseServerSnapshot(value: any): EcosystemSnapshot | null {
  if (!value) return null;
  const growthUnits = Number(value.growth_units ?? value.growthUnits ?? 0);
  const speciesSlug = value.active_species_slug ?? value.activeSpeciesSlug ?? 'english-oak';
  const activeSpecies = FOREST_MEADOW_SPECIES.find((species) => species.slug === speciesSlug) || FOREST_MEADOW_SPECIES[0];
  return {
    biome: 'forest_meadow',
    activeSpecies,
    unlockedSpecies: FOREST_MEADOW_SPECIES.filter((species) => species.unlockAt <= growthUnits),
    guests: FOREST_MEADOW_GUESTS.filter((guest) => guest.unlockAt <= growthUnits),
    nextGuest: FOREST_MEADOW_GUESTS.find((guest) => guest.unlockAt > growthUnits) || null,
    source: 'server',
    ...getEcosystemProgress(growthUnits),
  };
}

export const ecosystemService = {
  async getSnapshot({ userId, pointEvents }: EcosystemSnapshotInput): Promise<EcosystemSnapshot> {
    const storageKey = userId ? `${ACTIVE_SPECIES_KEY}:${userId}` : `${ACTIVE_SPECIES_KEY}:guest`;
    const savedSpecies = await AsyncStorage.getItem(storageKey).catch(() => null);

    if (userId && isSupabaseConfigured) {
      const { data, error } = await (supabase as any).rpc('get_my_ecosystem');
      if (!error) {
        const snapshot = parseServerSnapshot(Array.isArray(data) ? data[0] : data);
        if (snapshot) return snapshot;
      }
    }

    return buildLocalSnapshot(pointEvents, savedSpecies || undefined);
  },

  async selectSpecies(userId: string | undefined, slug: string, growthUnits: number): Promise<boolean> {
    const species = FOREST_MEADOW_SPECIES.find((entry) => entry.slug === slug);
    if (!species || species.unlockAt > growthUnits) return false;
    const storageKey = userId ? `${ACTIVE_SPECIES_KEY}:${userId}` : `${ACTIVE_SPECIES_KEY}:guest`;
    await AsyncStorage.setItem(storageKey, slug);
    if (userId && isSupabaseConfigured) {
      const { error } = await (supabase as any).rpc('select_ecosystem_species', { p_species_slug: slug });
      if (error) return false;
    }
    return true;
  },
};
