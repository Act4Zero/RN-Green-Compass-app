import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { PROFILES_BUCKET } from '@/services/profile/types';

// Simple in-memory cache for signed URLs
const avatarCache: { [path: string]: string } = {};

interface UseAvatarUrlResult {
  url: string | null;
  loading: boolean;
  error: string | null;
}

export function useAvatarUrl(path?: string | null, expires: number = 60): UseAvatarUrlResult {
  const [url, setUrl] = useState<string | null>(
    path && avatarCache[path] ? avatarCache[path] : null
  );
  const [loading, setLoading] = useState<boolean>(
    Boolean(path && !avatarCache[path])
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    if (avatarCache[path]) {
      setUrl(avatarCache[path]);
      setLoading(false);
      return;
    }
    let isMounted = true;
    supabase.storage
      .from(PROFILES_BUCKET)
      .createSignedUrl(path, expires)
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error || !data?.signedUrl) {
          setError(error?.message ?? 'Failed to get signed URL');
          setLoading(false);
        } else {
          avatarCache[path] = data.signedUrl;
          setUrl(data.signedUrl);
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [path, expires]);

  return { url, loading, error };
}
