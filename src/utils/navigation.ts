import type { Router } from 'expo-router';

const SAFE_DESTINATIONS = [
  '/home',
  '/community',
  '/ecosystem',
  '/habits',
  '/knowledge',
  '/map',
  '/marketplace',
  '/more',
  '/profile',
] as const;

export function sanitizeInternalDestination(
  value: string | string[] | undefined,
  fallback = '/home',
) {
  const candidate = (Array.isArray(value) ? value[0] : value)?.trim();
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) {
    return fallback;
  }

  const pathname = candidate.split(/[?#]/, 1)[0];
  const allowed = SAFE_DESTINATIONS.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );

  return allowed ? candidate : fallback;
}

export function goBackOrReplace(
  router: Pick<Router, 'back' | 'canGoBack' | 'replace'>,
  fallback = '/home',
) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(sanitizeInternalDestination(fallback) as any);
}
