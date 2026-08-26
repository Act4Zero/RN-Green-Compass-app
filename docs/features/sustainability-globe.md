# Sustainability Map platform

## Product and access contract

`/map` has two deliberately separate experiences:

1. Anonymous visitors receive a bundled, zero-Mapbox-cost preview with an explanation, the seven-category roadmap and sign-in/sign-up actions.
2. The interactive 3D globe is mounted only after Supabase resolves an authenticated session and the server-side `reserve_map_session` operation grants budget capacity.

The first catalogue covers Bulgaria. Categories use stable IDs:
`renewable_energy`, `local_organic`, `zero_waste`, `ev_charging`,
`recycling`, `green_spaces` and `community_events`. A category only appears in
runtime filters when at least one published record exists.

![Three sustainability globe style concepts](./images/sustainability-globe-style-previews.png)

The original Open Charge Map asset contains **89 connector records attached to
57 physical places**. The platform groups these records before producing
GeoJSON, so users see 57 selectable pins and retain all 89 connector details.
The previous claim that the file contains 89 distinct locations is superseded.

## Cost protection

The access order is strict: resolve auth → atomically reserve budget → mount
the map controller → load the renderer. Authentication alone is not treated as
a cost control because Mapbox GL JS meters each `Map` initialization.

`map_runtime_config` stores an emergency switch, the billing period and limits.
Defaults are 45,000 web initializations and 22,500 mobile installations, leaving
a 10% margin below the currently published Mapbox free tiers. Web reservations
increment atomically. iOS and Android count an opaque installation ID once per
billing period. The admin screen shows 70%, 85%, 95% and blocked states.

Internal counts are a conservative guard, not Mapbox invoice data. Use a
different public token per environment/platform, restrict the web token to its
domains and compare the admin count with Mapbox Statistics. Mapbox does not
currently provide a configurable hard spending cap.

An explicit local-only escape hatch exists for development:

```bash
EXPO_PUBLIC_MAP_BUDGET_BYPASS=true
```

Never set it in Vercel, EAS or another production environment.

## Architecture and data flow

- `app/map/index.tsx` owns the auth and budget gate. The external Mapbox script
  is not requested until the allowed branch renders `AuthenticatedMap`.
- `src/context/MapContext.tsx` owns one catalogue load, query, multi-category
  filters, viewport results, recommendations, camera, style, selection,
  geolocation and responsive panels.
- `src/features/sustainability-map/service.ts` implements Supabase RPC/table
  boundaries and the bundled catalogue fallback.
- `src/utils/locationDataUtils.ts` performs deterministic 89→57 connector
  normalization; `src/utils/mapGlobe.ts` owns GeoJSON/search/viewport helpers.
- The web renderer uses the exact Mapbox GL JS 3.27 browser distribution. The
  native renderer uses `@rnmapbox/maps@10.2.10` through the Expo config plugin.

The catalogue migration adds PostGIS locations, category joins, connectors,
credentials, moderated media/reviews/submissions, check-ins, impact factors,
preferences, curated routes and route stops. `community_projects` is extended
with coordinates and an optional location relationship for active event pins.

Remote catalogue failure falls back to the licensed bundled EV snapshot. It
does not fabricate other categories, ratings, credentials or event coverage.

## Discovery and profiles

- Search is case- and diacritic-insensitive across name, town, address and
  postcode. A query searches the full catalogue; an empty query sorts visible
  viewport results nearest the camera centre.
- Categories combine with OR semantics. Attributes/verification constraints
  combine with AND semantics.
- Mapbox receives a single clustered GeoJSON source. Search, filters and style
  changes update data/style without constructing another map instance.
- Location profiles support contact details, opening hours, multiple
  categories, connector options, approved rating summary, sustainability
  features, verified credentials, source/licence and external navigation.
- Credential and quantified sustainability claims require an evidence URL and
  editorial verification. User submissions never create a verified badge.

## Community, rewards and privacy

New-place and correction submissions, one review per user/location and photos
enter moderation queues. Approved new places/corrections update the curated
catalogue. Photos are limited to 8 MB, re-encoded as JPEG before upload to strip
EXIF/GPS metadata and stored in a private bucket.

Rewards reuse `user_points` and `user_badges`:

| Activity | Points |
| --- | ---: |
| Approved new location | 50 |
| Approved review | 10 |
| Approved photo | 5 |
| First check-in at a unique place | 5 |

Check-in is explicit, has no background GPS and is limited to one record per
place/day. Repeat visits remain in private statistics but only the first unique
visit earns points. Explorer and contributor badges are awarded at 1, 5 and 15
unique milestones with idempotent database writes.

Impact displays factual visit counts immediately. CO₂, water, waste or plastic
estimates require a published versioned factor, cited methodology and measured
quantity. An EV check-in alone never becomes an avoided-CO₂ claim.

Recommendations are deterministic: 40% explicit category preferences, 30%
distance, 20% unique community popularity and 10% newly verified. Analytics do
not receive search text, exact GPS, review text, installation IDs or personal
impact values.

## Events and Eco‑Tours

Only published, future `community_projects` with coordinates become event pins;
expired events disappear from the active map layer. Eco‑Tours are editorial
routes with BG/EN content, duration and ordered verified stops. Navigation is
delegated to Google Maps or Apple Maps one stop at a time—Green Compass does not
provide turn-by-turn routing.

## Credentials and builds

Runtime configuration:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://example.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=example-anon-key
EXPO_PUBLIC_MAPBOX_WEB_ACCESS_TOKEN=pk.web-example
EXPO_PUBLIC_MAPBOX_IOS_ACCESS_TOKEN=pk.ios-example
EXPO_PUBLIC_MAPBOX_ANDROID_ACCESS_TOKEN=pk.android-example
```

Apply `supabase/migrations/202608260002_sustainability_map_platform.sql`, grant
the appropriate account `reviewer`/`publisher` metadata, then use `/admin/map`
to import the bundled EV catalogue and confirm the budget period.

`MAPBOX_DOWNLOADS_TOKEN` is build-only and belongs in the local shell and
CI/EAS secret store. Never commit it, place it in Expo `extra`, print it in logs
or expose it to JavaScript.

Native Mapbox requires a custom development build and does not run in Expo Go:

```bash
npm install --legacy-peer-deps
npx expo prebuild --no-install
RNMAPBOX_MAPS_DOWNLOAD_TOKEN="$MAPBOX_DOWNLOADS_TOKEN" npx expo run:ios
RNMAPBOX_MAPS_DOWNLOAD_TOKEN="$MAPBOX_DOWNLOADS_TOKEN" npx expo run:android
```

## Acceptance criteria

- Anonymous, auth-loading, denied-budget and disabled-switch states never mount
  the renderer or request the external Mapbox runtime.
- An allowed authenticated session constructs one map instance; style, filter,
  search and panel changes preserve that instance and controller state.
- 89 licensed connector rows normalize to exactly 57 unique pins and all
  connector records remain visible/selectable.
- Only real published categories appear; search/filter changes neither reload
  the catalogue nor leave stale GeoJSON.
- Contributions, reviews and photos stay private until moderation; RLS prevents
  clients from publishing or verifying their own content.
- Check-ins, reward ledger entries and badges are idempotent. Impact never
  reports an estimate without a published cited factor.
- Preview, globe, profile drawer and supporting screens stay inside the app
  shell at 390px, 768px and 1440px with 48px controls, keyboard access and
  screen-reader labels.
- Required gates are TypeScript, ESLint, Jest, web/iOS/Android Expo exports,
  Android debug build and unsigned iOS simulator build. Native builds require
  their installed platform toolchains and the private downloads token.
- Release measurements remain first paint under two seconds on the documented
  mobile profile, Lighthouse Performance ≥85 and Accessibility ≥90.

## Release operations

Before each production release, verify the configured billing dates and limits,
Mapbox token restrictions, current Mapbox Statistics, migration status, storage
bucket policies and the moderation queue. If counts disagree or approach the
internal limit, disable the emergency switch before rotating/restricting the
production token.
