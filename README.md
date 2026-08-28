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
   EXPO_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
   EXPO_PUBLIC_MAP_PACK_MANIFEST_URL=https://your-project.supabase.co/storage/v1/object/public/sustainability-offline-maps/manifest.json
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

   The default detailed map is OpenFreeMap and does not require an API key.
   Omit both optional map variables to use the built-in online style and the
   metadata-only offline catalogue.

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
   - Add your Supabase credentials as environment variables in the Vercel project settings
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
