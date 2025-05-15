# Badge Engine: Architecture & Documentation

## Overview
The Badge Engine is a modular, extensible system for evaluating and awarding user badges based on a wide range of user activities, achievements, and community participation. It is designed for scalability, maintainability, and flexibility, supporting both declarative (rule-based) and custom (function-based) badge triggers.

- **Location:** `src/badges`
- **Key Files:**
  - `badgeEngine.ts` – Core badge evaluation and awarding logic
  - `triggerRegistry.ts` – Registry generator for all badge triggers
  - `types.ts` – TypeScript interfaces for context, rules, and triggers
  - `triggers/` – Category-specific badge rule and trigger definitions

---

## Architecture

### 1. Badge Trigger Registry
- **Purpose:** Centralizes all badge trigger logic, mapping each badge code to a trigger function.
- **How it works:**
  - Declarative rules (field/operator/value) are converted to functions using a generic trigger generator.
  - Custom badge triggers (complex logic) are implemented as functions and registered by badge code.
  - The registry is built by combining both declarative and custom triggers, ensuring all badge codes are covered.
- **File:** `triggerRegistry.ts`

### 2. Badge Trigger Functions
- **Declarative Triggers:**
  - Defined as rules specifying a profile/activity field, an operator (e.g., ">=", "=="), and a value.
  - Example: `{ code: 'streak_gold', field: 'streak_login', op: '>=', value: 30 }`
  - Automatically converted to a function that evaluates the rule.
- **Custom Triggers:**
  - Used for badges that require more complex logic than simple field comparison.
  - Example: Awarding a badge for logging in between 22:00 and 04:00 ("night owl").
  - Implemented as standalone functions and mapped by badge code.
- **Location:** `triggers/` subdirectory (e.g., `dailyFlow.ts`, `habitTracker.ts`, etc.)

### 3. Badge Evaluation Engine
- **Purpose:** Efficiently evaluates which badges should be awarded to a user based on the current context.
- **Workflow:**
  1. Loads all relevant badges (optionally filtered by category).
  2. For each badge, retrieves the corresponding trigger function from the registry.
  3. Executes all trigger functions in parallel for performance.
  4. Returns an array of results indicating which badges should be awarded.
- **Awarding:**
  - If a badge should be awarded and the user does not already have it, it is persisted (typically via a service layer).
- **File:** `badgeEngine.ts`

### 4. Context & Types
- **Context:**
  - Badge evaluation is based on a rich context object (`BadgeTriggerContext`) containing user profile, activity logs, goals, challenge participation, discussions, reactions, and more.
  - This enables highly flexible and expressive badge logic.
- **Types:**
  - All data structures and trigger function signatures are strictly typed using TypeScript interfaces for safety and clarity.
- **File:** `types.ts`

---

## Key Components

### 1. Registry Generator (`triggerRegistry.ts`)
- Combines declarative and custom triggers into a single registry object.
- Exposes `badgeTriggerRegistry`, mapping badge codes to trigger functions.
- Provides a generic `makeFieldTrigger` for field/operator/value rules.

### 2. Trigger Definitions (`triggers/`)
- Each badge category (e.g., daily flow, habit tracker, goal challenges, community, meta) has its own file.
- Exports an array of rules and all custom trigger functions for that category.
- Example categories:
  - `dailyFlow.ts` (login streaks, night owl)
  - `habitTracker.ts` (habit logging milestones, CO2 savings)
  - `goalChallenges.ts` (goal completion, challenge participation)
  - `community.ts` (discussion, helpfulness, mentoring)
  - `meta.ts` (early adopter, bug spotter, special events)

### 3. Badge Evaluation (`badgeEngine.ts`)
- `evaluateBadges(context, candidateBadges)`: Evaluates all candidate badges for a user and returns which should be awarded.
- `evaluateAndAwardBadges(userId, context, category?)`: Loads badges, evaluates, and awards new badges to the user.
- `processUserEvent(userId, eventType, context)`: Convenience wrapper for common event-driven badge evaluation (e.g., login, habit log).

### 4. Service Integration
- The engine integrates with a service layer (e.g., `badgesService`) to fetch badges and persist awarded badges.

---

## End-to-End Flow
1. **User performs an action** (e.g., logs in, completes a goal, posts in community).
2. **Context is built** for the user, containing all relevant profile and activity data.
3. **Badge engine is invoked** (typically via `processUserEvent` or `evaluateAndAwardBadges`).
4. **Engine loads badge definitions** (from DB or static config).
5. **Engine evaluates each badge** using the trigger registry.
6. **Badges that should be awarded** (and not already owned) are persisted and returned.

---

## Key Benefits
- **Declarative & Extensible:** Easily add new badges with simple rules or custom logic.
- **Modular:** Category-based organization keeps code maintainable and scalable.
- **Strictly Typed:** TypeScript interfaces ensure safety and clarity.
- **Batch/Parallel Evaluation:** Efficiently processes many badges at once.
- **Testable:** Pure functions for triggers enable straightforward unit testing.
- **Service Agnostic:** Integrates with any backend or service layer for badge storage.

---

## Future Enhancements
- **Dynamic Rule Loading:** Support for loading badge rules from a remote config or admin UI.
- **Badge Expiry/Revocation:** Logic for temporary badges or badge removal.
- **Rule Builder UI:** Visual editor for non-developers to define new badge rules.
- **Analytics Integration:** Track badge earning trends and user progress.
- **Localization:** Support for multi-language badge names and descriptions.

---

## Usage Example

```typescript
import { evaluateAndAwardBadges } from '@/src/badges/badgeEngine';
import { buildUserContext } from '@/utils/contextBuilder';

async function onUserLogin(userId: string) {
  // 1. Build the full context for badge evaluation
  const context = await buildUserContext(userId);

  // 2. Evaluate and award badges in the 'dailyFlow' category
  const newBadges = await evaluateAndAwardBadges(userId, context, 'dailyFlow');

  // 3. Notify user of new badges, update UI, etc.
  if (newBadges.length > 0) {
    showBadgeNotification(newBadges);
  }
}
```

---

## References
- Source: [`src/badges/`](../../src/badges/)
- Types: [`src/badges/types.ts`](../../src/badges/types.ts)
- Example triggers: [`src/badges/triggers/`](../../src/badges/triggers/)

---

> _For questions or contributions, see the README or contact the maintainers._
