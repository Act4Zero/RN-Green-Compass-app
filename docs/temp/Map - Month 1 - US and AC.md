> **Superseded:** This historical Month 1 brief describes the retired Leaflet implementation and aspirational seed data. The current acceptance criteria are in [`../features/sustainability-globe.md`](../features/sustainability-globe.md).

Map - Month 1 - US and AC

1 · Purpose
Enable first-time, unauthenticated visitors to open map.greencompass.app on any modern device and immediately browse a curated set of eco-friendly locations in Bulgaria.

2 · Scope
The requirements cover the publicly accessible, read-only web map, its data, deployment pipeline, and essential cross-device experience. User registration, profile management, or contribution flows are out of scope for this document.

3 · Definitions
Term	Meaning
Visitor	Any user who has not signed in or created an account.
Pin	A single location marker rendered on the map.
Seed dataset	Static JSON file (public/seed/locations.json) shipped with the web bundle.

4 · Functional Requirements
ID	Requirement	Key Acceptance / Completion Criteria

1. 2.
    
    **Main App Remains on app.greencompass.app**
    
    - ◦ The main app continues to live at .
        
        ```
        app.greencompass.app
        ```
        
- **`app.greencompass.app`**

**Pros:** Clean separation, independent deployments, separate environment variables. **Cons:** Code duplication unless you use a monorepo or shared packages.

**Option B: Single Codebase, Conditional Routing**

1. **Single Project, Vercel Routing**
    ◦ Use Vercel’s 

**`vercel.json`** to rewrite requests for 

**`map.greencompass.app`** to 

**`/map`** in your app.
    ◦ Example 

**`vercel.json`**:

`json

{  "rewrites": [    {      "source": "/(.*)",      "destination": "/map/$1",      "has": [{ "host": "map.greencompass.app" }]    }  ]}`
    ◦ This way, requests to 

**`map.greencompass.app`** render your 

**`/map`** screens.
2. **Conditional Logic (if needed)**
    ◦ Inside your Expo app, you can detect the subdomain and adjust behavior if necessary (e.g., using 

**`window.location.hostname`** in web).

1. 1.
    
    **Single Project, Vercel Routing**
    
    - ◦ Use Vercel’s  to rewrite requests for  to  in your app.
        
        ```
        vercel.json
        ```
        
        ```
        map.greencompass.app
        ```
        
        ```
        /map
        ```
        
    - ◦ Example :
        
        ```
        vercel.json
        ```
        
        ```
        json
        
        {
          "rewrites": [
            {
              "source": "/(.*)",
              "destination": "/map/$1",
              "has": [{ "host": "map.greencompass.app" }]
            }
          ]
        }
        
        ```
        
    - ◦ This way, requests to  render your  screens.
        
        ```
        map.greencompass.app
        ```
        
        ```
        /map
        ```
        
- **`vercel.json`**
    
    ```
    map.greencompass.app
    ```
    
    ```
    /map
    ```
    
- **`vercel.json`**
    
    ```
    json
    
    {
      "rewrites": [
        {
          "source": "/(.*)",
          "destination": "/map/$1",
          "has": [{ "host": "map.greencompass.app" }]
        }
      ]
    }
    
    ```
    
- **`map.greencompass.app`**
    
    ```
    /map
    ```

FR-01 Domain & SSL	The application shall be hosted at https://map.greencompass.app and served exclusively over HTTPS.	• URL resolves without redirects.
• Browser padlock icon indicates a valid TLS certificate.
• No mixed-content warnings in Chrome or Safari.
FR-02 OpenStreetMap + Leaflet Integration	The client shall initialise the OpenStreetMap + Leaflet with a domain-restricted API key and enforce hard quotas of ≤ 300 dynamic map loads/day and ≤ 100 geocode calls/day.	• Console shows no “API key not allowed” errors.
• A simulated 301st dynamic-map or 101st geocode request is rejected with HTTP 403 while billing dashboard remains unchanged.
FR-03 Seed Dataset Availability	On first load, the map shall consume public/seed/locations.json containing 140 – 160 location objects with the fields: 

{
    "id": "311445",
    "name": "Via Antiqua, Ceramic Factory",
    "lat": 42.848070270555496,
    "lng": 27.100741618369852,
    "town": "Luliakovo",
    "state_or_province": "Bourgas",
    "address_line_1": "Luliakovo Train Station",
    "address_line_2": null,
    "postcode": null,
    "country": null,
    "category": "EV Charging Stations",
    "source": "Open Charge Map",
    "licence": "Open Data Commons ODbL",
    "usage_cost": "0.70 BGN/kWh",
    "connection_type": null,
    "power_kw": 180,
    "level": null,
    "is_fast_charge_capable": false
  }

	• Automated JSON-schema validation (npm run validate:seed) passes.
FR-04 Map Rendering & Performance	The map shall centre on Sofia (≈ zoom 12) and render all seed pins within < 2 s on a 4G mobile connection.	• Lighthouse mobile Performance score ≥ 85.
FR-05 Category Filters	Six filter chips — EV, Recycling, Organic, Zero-Waste, Green Building, Community — shall be displayed above the map, defaulting to “all on”. Toggling a chip hides or shows pins whose category field matches the chip.	• Clicking each chip updates the visible pin count accordingly, with no stale markers.
FR-06 Coverage Guard-rail	If the map viewport centre drifts > 30 km from Bulgaria or zero pins fall within bounds, a dismissible banner shall appear stating “Coverage: Bulgaria only — Request your city”.	• Using DevTools to spoof GPS in London triggers the banner; spoofing Bulgaria hides it.
FR-07 Pin Visuals	Each pin shall display a category-specific icon overlay (≤ 20 KB SVG/PNG) rendered crisp on devices up to 2× pixel density.	• Element inspection confirms correct image source and retina clarity.



FR-08 API-Key Security	OpenStreetMap key shall be injected at build time via process.env.NEXT_PUBLIC_MAPS_KEY and restricted to the production host. Requests originating from any other host shall return HTTP 403.	• Curl from localhost with a spoofed referrer receives HTTP 403.
FR-11 Cross-Device Compatibility	The application shall function without JavaScript errors on:
• Desktop Chrome, Firefox, Safari at ≥ 1920 px width.
• iOS 15 Safari.
• Android 13 Chrome.	• Manual smoke-test: open 10 random pins per platform; console free of errors.
FR-12 Licence Attribution	A footer shall display: “Data © Open Charge Map, OpenStreetMap contributors …” with a link to /attributions.html opening in a new tab.	• Link navigates to attribution page listing all licences.

5 · Non-Functional Constraints
Performance: Initial page load time < 2 s on a 4G mobile network (75th percentile).

Resilience: The map must remain usable (minus dynamic features) if the Map exceeds its daily quota.

6 · Assumptions
Bulgaria remains the only supported geography until further roadmap updates.

No user authentication flows will be introduced in this milestone.
