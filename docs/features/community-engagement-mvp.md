# Community Engagement MVP

## Outcome

Green Compass members can learn publicly, collaborate privately, compare only the impact summaries they choose to share, and join reviewed local or global sustainability initiatives. The MVP builds on the existing discussions, comments, challenges, green points, badges, daily polls, daily eco-challenges, social sharing, and personalized Knowledge Hub recommendations.

## Implementation plan and acceptance contract

1. **Private circles and teams**
   - Members create `friends`, `team`, or `local` groups and invite others with a rotating code that expires after seven days.
   - Group membership never enables comparison automatically. Each member opts in per group, and global ranking visibility has its own explicit opt-in.
   - Comparison exposes only display name/avatar and aggregate points, streak, completed actions, and CO₂e avoided. Individual habits, travel entries, journals, gratitude notes, and poll choices remain private.

2. **Scoped competition and shared goals**
   - Points and streak leaderboards support global, friends, local, and selected-team scopes.
   - Private scopes include only opted-in members and always let the current member see their own row.
   - Any group member can create a time-bound points, actions, or CO₂e goal, log an idempotent contribution, see “You contributed,” and see each contributor’s aggregate amount.
   - Reaching the target completes the goal and raises an in-app milestone celebration with a privacy-safe native share action.

3. **Forums, knowledge sharing, and moderation**
   - Discussions use five categories: sustainable living, DIY projects, carbon reduction, community projects, and questions.
   - Existing likes, comments, Markdown, internal sharing, and native/social sharing remain available.
   - Members can report non-owned discussions once; reviewer/publisher roles can keep, pin, hide, or remove reported discussions.
   - Stories, eco-tips, articles, videos, and project ideas use a separate review queue. Articles/videos require HTTPS sources; v1 does not accept file uploads.
   - Approved submissions receive an idempotent 10-point reward and can appear as the daily community spotlight.

4. **Projects, events, polls, learning, and rewards**
   - A reviewed catalog highlights local meet-ups and global initiatives with organizer links, locations/virtual participation, participant totals, seasonal/current-event labels, and countdowns.
   - Members can join/leave projects and share them; project ideas enter the same editorial queue.
   - Community navigation links to the existing daily challenge/poll, monthly challenges, personalized learning paths, badges, green points, and streak rewards.
   - Virtual reward tiers and example achievement paths make progress legible. Commercial discounts, donations, and partner redemption are deferred until partner agreements, fraud controls, and fulfillment support exist.

## Public contracts and rollout

- Migration `202608260001_community_engagement_mvp.sql` creates the group, goal/contribution, project/participant, submission, and report tables; adds forum category/moderation fields; seeds reviewed initiatives; and enables `community_engagement_mvp`.
- Client mutations that cross user boundaries use authenticated, `security definer` RPCs with membership/editor checks and fixed `search_path`; table access is protected with RLS.
- Existing community and habit data is preserved. New discussion fields have backward-compatible defaults, and existing posts enter `sustainable_living` with `published` status.
- Deploy the migration before releasing the client. No external partner API, payment, discount, donation, direct messaging, public profile search, precise-location matching, or user media upload is included in this MVP.

## Cross-feature compatibility

- **Habits / Carbon Offsetting:** Community reads the shared `user_points` ledger and a private `get_community_impact_summary` boundary. A future carbon-activity migration can replace that function to include new verified activity tables without changing Community screens or exposing journals, poll choices, or raw travel records.
- **Knowledge Hub:** Community reuses `is_knowledge_editor`, existing learning routes, quiz rewards, and the single Green Points wallet. Approved submissions can be linked to a published `knowledge_items` record later; learning challenges and quests remain distinct from action-oriented group goals.
- **Sustainability Map:** `community_projects` is the canonical local/global events catalog and is intentionally extensible with future coordinates, event types, and verified-location links. Map contributions/reviews remain separate moderated records while sharing editor roles and rewards infrastructure.
- **Landing package and navigation:** The independent `landing/` workspace has no runtime or database dependency on Community. New Expo routes use the existing app shell and do not modify Mapbox, Knowledge, Habits, auth, or top-level navigation contracts.

## Verification

- Unit tests cover invite normalization, HTTPS-only links, submission rules, event countdowns, reward progress, typed group creation, code-based joining, and scoped leaderboard mapping.
- Required checks: TypeScript, changed-file lint with zero warnings, full tracked-source lint with zero errors, full Jest suite, `git diff --check`, and Expo exports for web, iOS, and Android.
- Manual acceptance after migration: create each group kind; join by code; expire/rotate a code; opt in/out; compare all leaderboard scopes; create/contribute/complete/share a goal; filter/create/report/moderate forum content; submit/approve/reject/feature content; verify one-time points; join/share projects; and verify daily poll/challenge links.
