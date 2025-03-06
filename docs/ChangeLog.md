# ChangeLog

## 2025-03-03
- Initial setup of ChangeLog.md file
- Integrated Supabase for authentication features (Sign up and Login)
  - Installed Supabase dependencies (@supabase/supabase-js)
  - Installed supporting packages (react-native-dotenv, expo-secure-store, react-native-url-polyfill)
  - Created Supabase client configuration in app/lib/supabase.ts
  - Set up environment variables structure with .env file and babel configuration
  - Created AuthContext for managing authentication state
  - Updated app/_layout.tsx to include the AuthProvider
  - Added TypeScript types for Supabase database schema
  - Created comprehensive documentation for Supabase setup in docs/SUPABASE_SETUP.md

## 2025-03-06
- Fixed environment variables configuration to be compatible with expo-router
  - Removed react-native-dotenv from babel.config.js as it conflicts with expo-router
  - Created app.config.js to use Expo's configuration system for environment variables
  - Updated supabase.ts to use Constants.expoConfig.extra instead of @env imports
  - Implemented a simple in-memory storage adapter for Supabase auth after encountering issues with both SecureStore and AsyncStorage
  - Created .env.example file with the new EXPO_PUBLIC_ prefix naming convention
  - Updated SUPABASE_SETUP.md documentation with the new environment variables approach
  - Added fallback values for Supabase URL and key in supabase.ts to prevent "Invalid URL" errors
  - Modified app.config.js to directly access environment variables
