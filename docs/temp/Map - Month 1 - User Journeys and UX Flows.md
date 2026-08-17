> **Superseded:** This historical Month 1 brief describes the retired map. The current requirements are in [`../features/sustainability-globe.md`](../features/sustainability-globe.md), including the verified 89-location EV dataset, Europe-first 3D globe, dynamic categories, and responsive discovery UI.

Map - Month 1 - User Journeys and UX Flows

Sustainability Map – Functional Requirements
Journey: “Explore the Sustainability Map” (unauthenticated React / Expo web app)

1 · Purpose
Enable first-time visitors to seamlessly explore a sustainability-focused map of Sofia, including detailed place cards and graceful handling of out-of-coverage scenarios, without requiring login.

2 · Scope
These requirements cover the Explore flow only (stages 0-6). They exclude features such as user accounts, contribution tools, analytics dashboards, or premium business listings.

3 · Definitions
Term	Meaning
Stage	A discrete screen or UI state in the journey.
Pin	A location marker rendered on the Google Map.
Chip	A category filter toggle (six defined categories).
FAB	Floating Action Button for “Locate me”.

4 · Functional Requirements
ID	Requirement	Acceptance / Completion Criteria
FR-01 App Launch	On app launch, a branded splash loader (leaf icon) is displayed for ≈ 1 s while the JS bundle and initial Google Maps tiles are fetched.	• First paint occurs within < 2 s on a 4 G mobile connection.
• Splash dismisses automatically after bundle load or 1 s, whichever is later.
FR-02 Map Home (Stage 1)	The default home view centres on Sofia at zoom 12 and includes:
– Google Map canvas
– Six category chips (single-row, horizontally scrollable on mobile)
– “Coverage: Bulgaria only” ribbon pinned beneath chips
– 150 ± 10 clustered pins
– Locate-me FAB.	• Panning/zooming updates pins client-side with no network calls.
• At least one pin is clickable on initial view.
• Chips indicate overflow on mobile via native shadow.
FR-03 Category Chips Interaction	Tapping a chip toggles visibility of pins matching the chip’s category.	• Chip pulses for ≈ 2 s (deep-link case) when URL contains ?utm_source=landing.
• Goal metric: ≥ 20 % of such sessions result in a chip toggle event.
FR-04 Pin Detail Card (Stage 2)	Selecting a pin slides a grey detail card from the bottom to 50 % height using Framer Motion (250 ms). The card displays: place name, category icon, short description (≤ 60 characters), and an “Open in Google Maps” button.	• Tapping outside the card dismisses it with the same animation.
• Goal metric: ≥ 40 % of sessions open at least one card.
FR-05 No-Data View (Stage 3)	When the user’s geolocation is > 30 km from Sofia or zero pins fall within the current viewport, a masked-area overlay and banner appear: “We’re mapping Sofia first—request your city ➜”.	• Banner CTA navigates to /map?form=city-request in the same tab.
• Bounce rate while banner is shown ≤ 25 %.
FR-06 Locate-me Error (Stage 4)	If the browser denies geolocation, a toast appears: “Couldn’t get your location—check browser settings.”	• Toast is non-blocking and auto-dismisses after 4 s.
FR-07 Deep-Link Behaviour (Stage 5)	Visiting the map with query param ?utm_source=landing triggers a subtle pulse animation on the category chips for 2 s to draw attention.	• Animation runs once per page load; chips remain fully functional during and after the pulse.
FR-08 Sticky Footer & Attribution (Stage 6)	A 12 pt sticky footer remains visible at viewport bottom, even if later lists or content push the map upward. Footer text: “Data © Open Charge Map … Privacy • Attributions”.	• Links open in a new tab.
• Footer remains visible during scroll on all supported devices.

5 · Non-Functional Constraints
Performance: Maintain Lighthouse mobile Performance score ≥ 85 for the Explore flow.

Animation Smoothness: All Framer Motion transitions must hit ≥ 60 FPS on mid-range Android devices.

Accessibility: Achieve Lighthouse Accessibility score ≥ 90; toast and banner texts are screen-reader friendly.

6 · Observability & Product Metrics
Metric	Target
First paint on 4 G mobile	< 2 s
Stage 1 pin click-through	≥ 1 click / session
Detail card open rate	≥ 40 % of sessions
Bounce rate when No-Data banner shown	≤ 25 %
Chip toggle engagement after deep-link	≥ 20 % of affected sessions

7 · Assumptions
The Explore flow is the primary entry point; other journeys (e.g., “Contribute a Place”) are future work.

External analytics tooling will capture engagement metrics; instrumentation events will be defined separately.

8 · Open Questions
#	Question	Needed By
Q1	Which analytics platform will record the success metrics?	Sprint planning
Q2	Should the masked-area overlay be interactive (e.g., clickable opacity to return to Sofia)?	UX review
