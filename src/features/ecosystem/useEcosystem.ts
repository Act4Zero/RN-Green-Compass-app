import { useCallback, useEffect, useState } from 'react';
import type { PointEvent } from '@/types/community/points';
import { buildLocalSnapshot } from './progression';
import { ecosystemService } from './service';
import type { EcosystemBiomeId, EcosystemSnapshot } from './types';

export function useEcosystem(userId: string | undefined, pointEvents: PointEvent[]) {
  const [snapshot, setSnapshot] = useState<EcosystemSnapshot>(() => buildLocalSnapshot(pointEvents));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSnapshot(await ecosystemService.getSnapshot({ userId, pointEvents }));
    } finally {
      setLoading(false);
    }
  }, [pointEvents, userId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const selectSpecies = useCallback(async (slug: string) => {
    const selected = await ecosystemService.selectSpecies(userId, slug, snapshot.growthUnits);
    if (selected) await refresh();
    return selected;
  }, [refresh, snapshot.growthUnits, userId]);

  const selectBiome = useCallback(async (biome: EcosystemBiomeId) => {
    const selected = await ecosystemService.selectBiome(userId, biome);
    if (selected) await refresh();
    return selected;
  }, [refresh, userId]);

  return { snapshot, loading, refresh, selectSpecies, selectBiome };
}
