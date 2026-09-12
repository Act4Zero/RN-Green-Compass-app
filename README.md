# Green Compass App 🌱

This is a React Native application built with [Expo](https://expo.dev) that helps users track sustainable habits and reduce their environmental footprint.

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up environment variables
   
   Create a `.env` file in the root directory with the following variables:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
   EXPO_PUBLIC_TURNSTILE_BASE_URL=https://rn-green-compass-app.vercel.app
   EXPO_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
   EXPO_PUBLIC_MAP_PACK_MANIFEST_URL=https://your-project.supabase.co/storage/v1/object/public/sustainability-offline-maps/manifest.json
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

   The default detailed map is OpenFreeMap and does not require an API key.
   Omit both optional map variables to use the built-in online style and the
   metadata-only offline catalogue.

   Supabase CAPTCHA protection requires the public Turnstile site key in every
   Expo/Vercel build. Add `rn-green-compass-app.vercel.app` to the Turnstile
   widget's allowed hostnames. Native WebViews use `EXPO_PUBLIC_TURNSTILE_BASE_URL`
   as their trusted page origin; local web development needs a Turnstile testing
   key or a separately allowed development hostname. The existing production
   Vercel deployment also has a public site-key fallback in `app.config.js`, so
   production builds do not require access to the Vercel environment settings.

   All application screens require a session, including direct links to the map,
   knowledge and marketplace. Sign-in, registration and account recovery remain
   accessible without a session.

   In Supabase **Authentication → URL Configuration → Redirect URLs**, allow
   `https://rn-green-compass-app.vercel.app/auth/reset-password` (and the matching
   path on each preview/development origin) plus `greencompass://auth/reset-password`
   for native password recovery. Keep the existing OAuth/confirmation callbacks.
   The recovery screen completes `auth.updateUser` using the recovery session.
   These external settings must be checked in the target environment; a local
   build or mocked authentication test does not validate them.

3. Start the app

   ```bash
   npx expo start
   ```

   In the output, you'll find options to open the app on:
   - iOS simulator
   - Android emulator
   - Web browser
   - Physical device using a custom development build

   Living Planet uses Three.js/GLView and the detailed map uses native MapLibre,
   so native development requires a custom development build rather than Expo Go:

   ```bash
   npx expo prebuild --no-install
   npx expo run:ios
   # or
   npx expo run:android
   ```

   Web development continues to work with `npx expo start --web`. See
   [`docs/features/sustainability-globe.md`](docs/features/sustainability-globe.md)
   for architecture, styling, credentials, testing, and data/licensing details.
   Marketplace setup, Stripe Connect secrets, partner acceptance and rollout are
   documented in
   [`docs/features/sustainability-marketplace.md`](docs/features/sustainability-marketplace.md).

   * 3.1. Alternative way to run the app

      ```bash
      npx expo start --clear
      ```

      *This will clear the Metro bundler cache and restart the app.*

## Deployment with Vercel

This project is configured for deployment on Vercel. Follow these steps to deploy:

1. Push your code to a GitHub repository

2. Connect your repository to Vercel:
   - Sign up/login to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the "Expo" framework preset

3. Configure environment variables:
   - Add your Supabase and Turnstile variables in the Vercel project settings
   - Use the same variable names as in your local `.env` file

4. Deploy:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

5. Alternatively, deploy using Vercel CLI:
   ```bash
   vercel login
   vercel
   ```

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


### Sofia cycling layer

On the map, select **Велоалеи · София / Sofia cycleways** to focus on Sofia and
show separately styled cycle paths, cycle lanes and shared sections. Tap a line
or point for source details. The legend also controls bicycle parking and
fountains. The layer uses a dated, bundled OpenStreetMap snapshot, including
source attribution; it is not turn-by-turn routing or a live closure feed.
See `src/features/cycling/data/README.md` for provenance and the update command.
