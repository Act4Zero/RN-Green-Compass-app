# Living Planet map platform

## Experience

`/map` is public. It opens an author-built Three.js globe with local land
geometry, real UTC sunlight, atmosphere, category pulses and reduced-motion
support. Drag rotates the planet; double-click/tap or selecting a place starts
the 700–900 ms `globe → to-map → map` transition. Zooming the detailed map
below national level reverses the transition. Only one renderer owns gestures
during a transition.

The globe never requests map tiles. Web and native share the scene and use
platform Canvas adapters. If WebGL/GLView fails, the bundled Living Planet
composition remains interactive and provides a direct route to the map.

## Detailed map

- Web: `maplibre-gl` with the configurable `EXPO_PUBLIC_MAP_STYLE_URL`.
- iOS/Android: `@maplibre/maplibre-react-native@10`.
- Default online style: `https://tiles.openfreemap.org/styles/liberty`.
- Attribution is always visible for OpenStreetMap and the active distributor.
- Apple/Google Maps opens only after the user presses **Open in Maps**.

OpenFreeMap has no API key and no SLA. The application never sends requests to
the public `tile.openstreetmap.org` servers. Mapbox SDKs, tokens, styles,
satellite mode, client budget reservations and installation tracking are not
part of the runtime.

## Offline PMTiles

Native users choose packages from `/map/offline`; no map is embedded in the app
binary. The first catalogue contains Bulgaria overview (z0–10) and Sofia,
Plovdiv, Varna, Burgas, Ruse and Stara Zagora (z11–16).

The production manifest is configured with
`EXPO_PUBLIC_MAP_PACK_MANIFEST_URL`. Each entry has a stable ID, BG/EN name,
bounds, zoom range, version, byte size, SHA-256 and HTTPS URL. Downloads check
free space, can reuse resume data, hash the file in 1 MB chunks and atomically
rename it to `.pmtiles` only after verification. Maps over 50 MB ask before
using a cellular connection. Airplane mode automatically selects the installed
package with the highest maximum zoom that contains the camera centre.

Build a release from an up-to-date Protomaps snapshot with:

```bash
PMTILES_BIN=/path/to/pmtiles npm run maps:build-offline -- \
  planet.pmtiles dist/offline-maps 2026-08-01 \
  https://PROJECT.supabase.co/storage/v1/object/public/sustainability-offline-maps
```

Upload the generated seven `.pmtiles` files and `manifest.json` to the public
`sustainability-offline-maps` bucket. The offline style is bundled, label-free
and needs no external glyph or sprite request.

## Public data and protected actions

Migration `202608270001_living_planet_public_map.sql` exposes only published
place fields through `get_public_sustainability_map` and approved reviews
through `get_public_sustainability_reviews`. Phone, email, moderation fields,
check-ins and user data are excluded. Anonymous users can browse/search/filter;
check-in, review, photo, contribution and personal impact redirect to sign-in
and return to the same route/place.

Legacy map-budget tables/functions remain for one rollback release, but execute
is revoked from `public`, `anon` and `authenticated`. The admin screen contains
only catalogue import, PMTiles status and moderation.

## Quality gates

`npm run guard:no-mapbox` fails if source, config or native projects contain a
Mapbox endpoint, style URL, runtime token variable or SDK. CI also runs strict
TypeScript, ESLint, Jest, Expo exports, native builds and the isolated public
RLS migration contract.

Acceptance requires anonymous browsing, no Mapbox request, working
globe→map→globe state preservation, 2D fallback, reduced motion and at least
30 FPS in the adaptive profile. Offline release acceptance additionally
requires all seven signed packages to pass download/resume/SHA-256 and airplane
mode checks on physical iOS and Android devices.
