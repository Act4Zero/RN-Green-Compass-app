import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { PointEvent } from '@/types/community/points';
import { buildLocalSnapshot } from './progression';
import { ecosystemService } from './service';
import type { EcosystemBiomeId, EcosystemSnapshot } from './types';

export function useEcosystem(userId: string | undefined, pointEvents: PointEvent[]) {
  const [snapshot, setSnapshot] = useState<EcosystemSnapshot>(() => buildLocalSnapshot(pointEvents));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const request = useRef(0);
  const mutation = useRef(false);

  const refresh = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError(false);
    try {
      const next = await ecosystemService.getSnapshot({ userId, pointEvents });
      if (current === request.current) setSnapshot(next);
    } catch {
      if (current === request.current) setError(true);
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [pointEvents, userId]);

  // A selection on the species screen must also refresh the retained home screen.
  useFocusEffect(useCallback(() => {
    void refresh();
    return () => { request.current += 1; };
  }, [refresh]));

  const save = useCallback(async (operation: () => Promise<boolean>) => {
    if (mutation.current) return false;
    mutation.current = true;
    request.current += 1;
    setSaving(true);
    setError(false);
    try {
      const selected = await operation();
      if (selected) await refresh();
      else setError(true);
      return selected;
    } catch {
      setError(true);
      return false;
    } finally {
      mutation.current = false;
      setSaving(false);
    }
  }, [refresh]);

  const selectSpecies = useCallback((slug: string) => save(() => ecosystemService.selectSpecies(userId, slug, snapshot.growthUnits)), [save, snapshot.growthUnits, userId]);
  const selectBiome = useCallback((biome: EcosystemBiomeId) => save(() => ecosystemService.selectBiome(userId, biome)), [save, userId]);

  return { snapshot, loading, saving, error, refresh, selectSpecies, selectBiome };
}
