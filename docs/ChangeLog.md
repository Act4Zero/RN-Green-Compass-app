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

## 2025-03-06 (Signup/Login Prototype Implementation)
- Created complete authentication UI flow:
  - Implemented Welcome screen with app introduction and authentication options
  - Created Sign Up screen with email, password, and terms agreement
  - Developed Login screen with email, password, and forgot password option
  - Added password reset functionality
  - Implemented social authentication options (Google, Apple)
  - Created success screen and redirection to home dashboard
- Added UI components:
  - Custom Button component with primary, secondary, and outline variants
  - Form Input component with validation
  - Error message display
  - Password strength indicator
  - SocialButton component for Google and Apple authentication
- Implemented form validation:
  - Email format validation
  - Password strength requirements
  - Required field validation
  - Terms and conditions acceptance validation
- Added responsive design:
  - Used flexbox for layout
  - Implemented adaptive sizing based on screen dimensions
  - Added proper spacing and alignment
  - Optimized UI for both mobile and tablet/desktop views
- Integrated with Supabase authentication:
  - Connected sign up form to Supabase signUp method
  - Connected login form to Supabase signIn method
  - Implemented password reset flow using Supabase resetPasswordForEmail
  - Added social authentication providers (prepared for implementation)
- Improved user experience:
  - Added loading states during authentication
  - Implemented error handling with user-friendly messages
  - Created smooth transitions between screens
  - Added automatic redirection based on authentication state

## 2025-03-06 (Additional Authentication Screens)
- Created Forgot Password screen:
  - Implemented email validation
  - Added password reset request functionality using Supabase
  - Created success state with confirmation message
- Created Signup Success screen:
  - Added success confirmation with animated checkmark
  - Implemented automatic redirection to home after 5 seconds
  - Added manual continue button for immediate navigation
- Created Home screen dashboard:
  - Implemented welcome header with user information
  - Added sustainability statistics cards
  - Created tips section for sustainability advice
  - Added sign out functionality
  - Implemented responsive layout for different screen sizes
- Enhanced navigation flow:
  - Updated index.tsx to handle authentication state and redirection
  - Implemented proper navigation between all authentication screens
  - Added protection for authenticated routes

## 2025-03-06 (Additional UI Improvements)
- Enhanced responsive design across all authentication screens:
  - Standardized container styling with consistent padding and alignment
  - Fixed scaling issues on web and mobile platforms
  - Improved content alignment and spacing for better visual hierarchy
  - Applied consistent styling patterns across all authentication screens
  - Ensured proper form element alignment and spacing
  - Optimized layout for both small mobile screens and larger tablet/desktop displays
- Fixed errors and warnings:
  - Fixed ReferenceError in supabase.ts by properly implementing the default export with an empty object instead of trying to export types as values
  - Fixed React ref forwarding warnings by removing the `asChild` prop pattern in all authentication screens
  - Replaced Link components with direct navigation using the router.push method
  - Updated the Welcome component to use direct navigation instead of nested components with refs

## 2025-03-06 (Supabase Authentication Integration)
- Connected authentication screen buttons with Supabase DB functions:
  - Implemented proper error handling for authentication functions
  - Connected signup form to Supabase signUp method with validation
  - Connected signin form to Supabase signIn method with validation
  - Added loading states during authentication processes
  - Implemented proper navigation after successful authentication
  - Prepared social authentication buttons for future implementation
  - Added proper error messages for authentication failures

## 2025-03-06 (Sign-out Functionality Enhancement)
- Enhanced sign-out functionality in the Home screen:
  - Updated the handleSignOut function to redirect to the signin screen after successful logout
  - Added error handling to display a generic error message if sign-out fails
  - Implemented useRouter hook for programmatic navigation
  - Added loading state during sign-out process to improve user experience
  - Ensured proper cleanup of user session after sign-out

## 2025-03-07 (Google OAuth Integration)
- Implemented Google OAuth authentication:
  - Installed @react-native-google-signin/google-signin package for native Google Sign-In
  - Added expo-auth-session and expo-web-browser for web platform support
  - Updated app.config.js with Google OAuth configuration
  - Added signInWithGoogle method to AuthContext
  - Implemented Google Sign-In functionality in signin.tsx and signup.tsx
  - Added proper error handling for Google authentication
  - Updated SocialButton component to handle Google authentication flow
  - Integrated Google Sign-In with Supabase authentication
  - Added platform-specific implementation for Android, iOS, and web

## 2025-03-07 (Google OAuth Configuration Fix)
- Fixed Google Sign-In configuration issues:
  - Enhanced error handling in AuthContext.tsx to gracefully handle missing client IDs
  - Added detailed logging of Google Sign-In configuration status
  - Updated app.config.js to provide fallback values for Google client IDs
  - Added validation checks before attempting Google Sign-In to prevent configuration errors
  - Improved error messages to guide users when Google client IDs are not properly configured

## 2025-03-07 (Welcome Screen Google Sign-In Integration)
- Implemented Google Sign-In in the Welcome component:
  - Connected the Welcome screen's Google button to the AuthContext's signInWithGoogle method
  - Added loading state and error handling to improve user experience
  - Implemented navigation to home screen after successful authentication
- Enhanced the SocialButton component:
  - Added support for disabled state during loading
  - Implemented visual styling for disabled state
  - Improved accessibility by properly handling disabled interactions
  - Added TypeScript types for the disabled prop

## 2025-03-08 (Removing Google Sign-In)
- Removed Google Sign-In from the Welcome screen:
  - Removed Google Sign-In button from Welcome component
  - Updated AuthContext to remove Google Sign-In method
  - Updated signin and signup screens to remove Google Sign-In options

## 2025-03-10 (Moved Authentication Screens to Authentication Directory)
- Moved authentication screens to app/authentication directory:
  - Moved signin.tsx to app/authentication/signin.tsx
  - Moved signup.tsx to app/authentication/signup.tsx
  - Moved home.tsx to app/home.tsx
  - Moved welcome.tsx to app/welcome.tsx
  - Updated imports in other files to reflect new locations

## 2025-03-10 (Habit Tracking and Sustainability Goals Implementation)
- Created database schema types for habit tracking in app/types/supabase.ts:
  - Added Habit interface for defining sustainable habits
  - Added UserHabit interface for tracking user-selected habits
  - Added HabitLog interface for recording completed habit actions
  - Added UserGoal interface for tracking sustainability goals
- Implemented habit service in app/services/habitService.ts:
  - Created methods to fetch habits from the database
  - Added functionality to manage user habits (add, update, remove)
  - Implemented habit logging with CO2 impact calculation
  - Added goal tracking and progress updating
  - Created methods for calculating statistics (CO2 saved, streaks, etc.)
- Implemented context and hooks for habit tracking:
  - Created HabitContext (app/context/HabitContext/HabitContext.tsx) for centralized state management
  - Implemented useHabitTracking hook (app/hooks/useHabitTracking.ts) for habit management
  - Created useGoals hook (app/hooks/useGoals.ts) for sustainability goals
  - Added useHabitStats hook (app/hooks/useHabitStats.ts) for tracking statistics
- Added functionality for:
  - Tracking habits with frequency and period settings
  - Logging completed habits with quantity and notes
  - Creating and managing sustainability goals
  - Calculating CO2 impact and environmental statistics
  - Tracking streaks and progress towards goals
  - Filtering and sorting habits and goals by category
  - Calculating goal progress percentages