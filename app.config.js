// Keep this config file CommonJS. Mixing an ESM import with `module.exports`
// causes Node/Expo to load an empty config, dropping all `extra` values in
// the web bundle even when Vercel provides them at build time.
// Expo evaluates the app config before its public-variable pass in some static
// export modes. Load local development values explicitly while keeping values
// supplied by CI/Vercel authoritative (dotenv does not overwrite them).
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const EXPO_PUBLIC_GOOGLE_REDIRECT_URI = process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI;
const EXPO_PUBLIC_TURNSTILE_SITE_KEY = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY;
const EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
const EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (process.env.VERCEL_ENV === 'production' && (!EXPO_PUBLIC_SUPABASE_URL || !EXPO_PUBLIC_SUPABASE_ANON_KEY)) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in the Vercel Production environment.'
  );
}

module.exports = {
  name: "GreenCompass",
  slug: "GreenCompass",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/GCLogo-no-bg.png",
  scheme: "greencompass",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.act4zero.GreenCompass",
    config: {
      googleSignIn: {
        reservedClientId: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
      }
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/GCLogo-no-bg.png",
      backgroundColor: "#ffffff"
    },
    package: "com.act4zero.GreenCompass"
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/GCLogo-no-bg.png"
  },
  plugins: [
    "expo-router",
    "expo-notifications",
    "@rnmapbox/maps",
    [
      "@stripe/stripe-react-native",
      {
        "merchantIdentifier": "merchant.com.act4zero.GreenCompass",
        "enableGooglePay": true
      }
    ],
    [
      "expo-location",
      {
        "locationWhenInUsePermission": "Show your position on the Sustainability Globe."
      }
    ],
    [
      "expo-splash-screen",
      {
        "image": "./assets/images/GCLogo-no-bg.png",
        "imageWidth": 200,
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  // Add extra configuration for environment variables
  extra: {
    supabaseUrl: EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: EXPO_PUBLIC_SUPABASE_ANON_KEY,
    googleWebClientId: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    googleIosClientId: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    googleAndroidClientId: EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    // For web, this should match the redirect URI configured in Google Cloud Console
    // This should be the same URI that's configured in your Google Cloud Console
    googleRedirectUri: EXPO_PUBLIC_GOOGLE_REDIRECT_URI,
    // Cloudflare Turnstile site key for captcha
    turnstileSiteKey: EXPO_PUBLIC_TURNSTILE_SITE_KEY,
    mapboxAccessToken: EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
    stripePublishableKey: EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  }
};
