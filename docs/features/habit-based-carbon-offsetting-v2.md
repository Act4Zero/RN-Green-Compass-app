# Habit-Based Carbon Offsetting V2

## Product behavior

V2 extends the existing Habits experience with a versioned `2026.2` Green Identity assessment, a measured carbon activity ledger, measurable goals, local reminders, country/global reference benchmarks, provider-confirmed offset history, and a carbon balance that keeps four values separate:

1. gross tracked emissions;
2. estimated avoided emissions;
3. fulfilled or retired provider offsets;
4. the remaining tracked balance.

Figures are directional estimates and are not an emissions inventory, certification, verified reduction, or carbon-neutrality claim. A comparison creates avoided impact only when both templates use the same unit and the user explicitly chooses the alternative.

## Methodology and sources

- Activity calculations snapshot a versioned factor, unit, methodology, source URL, and result at log time. Transport and household-energy templates use the UK Government GHG Conversion Factors 2026 where applicable.
- Country and global references use EDGAR's 2025 report for 2024 territorial GHG emissions per capita excluding LULUCF. They are contextual references and are never presented as a direct above/below comparison with a partial personal tracker.
- The tree visualization uses the US EPA urban-tree-seedling methodology and says “equivalent”; it never claims that a tree was planted. Plastic, water, and waste remain direct measures in their original units.
- Food, purchase, and mixed-waste templates are explicitly labelled directional learning estimates until a reviewed inventory-grade factor replaces them.

## Privacy, rewards, and offsets

- Activities, goals, reminders, checkout sessions, contributions, and reflections are owner-scoped under RLS. Public users may read only active reviewed catalogs.
- Leaderboards include only profiles that explicitly opt in, and rank existing aggregate points or streaks. Offset purchases never award points or affect rank.
- The mobile app never handles card data. `create-offset-checkout` creates a Cloverly-hosted checkout through server-side credentials. Only a signed, replay-protected webhook or reconciliation result can create a fulfilled/retired contribution.
- Private reflection text is never copied into an activity, share, or community post. A daily check-in can create one idempotent preset activity with a generic note.

## Deployment order

1. Apply `202608260003_habit_offsetting_v2.sql`.
2. Configure and deploy `create-offset-checkout`, `cloverly-webhook`, and `reconcile-offsets`.
3. Set `CLOVERLY_API_KEY`, `CLOVERLY_DIRECT_CHECKOUT_ENDPOINT`, `CLOVERLY_CHECKOUT_STATUS_ENDPOINT`, `CLOVERLY_WEBHOOK_SECRET`, `OFFSET_RETURN_URL`, and `OFFSET_RECONCILIATION_SECRET`.
4. Keep `OFFSET_PROVIDER_ENABLED=false` until commercial onboarding, project metadata review, webhook verification, and sandbox acceptance are complete.
5. Deploy the Expo application routes after the database and functions are available.

Opening or merging the pull request does not apply production migrations or enable purchases.

## Verification

- TypeScript: passed (`tsc --noEmit`).
- Feature-scoped ESLint: passed with no errors or warnings.
- App-scoped ESLint: passed with no errors; the existing repository warning baseline remains unchanged outside feature-owned code.
- Jest: 17 suites and 71 tests passed.
- Expo exports: web, iOS, and Android passed.
- Visual screenshot: not captured because no browser surface was connected to the Codex session; the web export route manifest was verified instead.
