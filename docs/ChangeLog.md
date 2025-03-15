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

## 2025-03-11 (Habit Tracking UI Implementation & Enhancements)

- **Onboarding and Goal Selection**
  - Created onboarding screen (`app/authentication/onboarding.tsx`) for sustainability goal selection and tracking frequency (daily/weekly/monthly)
  - Integrated onboarding with `useGoals` hook for goal management

- **Habit Tracking Dashboard**
  - Updated home dashboard (`home.tsx`) with goal progress cards, streak visualization, and "Log a Habit" action
  - Connected dashboard components to `useHabitStats` hook for real-time statistics

- **Habit Logging Interface**
  - Implemented habit logging screen (`app/habits/log.tsx`) with category/subcategory selection and predefined habit options
  - Added confirmation message upon habit logging
  - Integrated habit logging functionality with `useHabitTracking` hook

- **Habit History and Progress**
  - Created habit history screen (`app/habits/history.tsx`) featuring calendar/list views and filtering by category
  - Displayed streak and goal tracking statistics using the `useHabitStats` hook

- **Navigation and Routing**
  - Enhanced app navigation (`app/_layout.tsx`) to include habit tracking screens
  - Implemented proper onboarding routing post-signup

- **Responsive Design**
  - Ensured responsive layout across various devices using `useWindowDimensions` hook

- **TypeScript Improvements and Fixes**
  - Added missing `'section'` style property to `home.tsx` Styles interface
  - Fixed navigation type errors through proper path type-casting in `home.tsx`
  - Updated `Input` component to handle multiline input and fixed style types (`ViewStyle` → `TextStyle`)
  - Properly imported `useHabit` hook in `history.tsx` for habit logs access
  - Corrected width property type in password strength indicator

- **Additional Functionalities**
  - Implemented habit tracking with frequency, period, quantity, and notes
  - Added creation and management of sustainability goals
  - Calculated and displayed CO₂ impact and environmental statistics

## 2025-03-12 (User Goals Onboarding Flow Enhancement)

- **Improved Onboarding Flow for User Goals**
  - Enhanced onboarding screen to handle both new user and existing user contexts
  - Implemented functionality to create new user goals during signup flow
  - Added ability to update existing goals when accessed from home screen
  - Integrated skip functionality for new users to bypass onboarding
  - Added context-aware UI elements (skip button only shown during signup flow)
  - Implemented proper database operations for creating and updating user_goals records
  - Added validation for required fields (id, created_at, updated_at, user_id, goal_name, start_date, category)
  - Enhanced error handling and loading states during goal operations

## 2025-03-12 (Fixed User Goals Saving Issue)

- **Fixed User Goals Creation and Update Functionality**
  - Fixed issue where user goals were not being saved to the database
  - Added explicit timestamps (created_at, updated_at) to goal creation and update operations
  - Enhanced Button component to properly handle press events with improved logging
  - Updated HabitContext to return created/updated goal objects for better tracking
  - Added comprehensive logging throughout the goal creation process for debugging
  - Modified createGoal and updateGoal functions to return the goal object instead of void
  - Fixed TypeScript interfaces to properly reflect the database schema

## 2025-03-13 (Fixed Database Schema Mismatch)

- **Fixed Database Schema Mismatch in User Goals**
  - Fixed error: "column user_goals.is_completed does not exist" that was occurring when fetching active goals
  - Fixed error: "Could not find the 'title' column of 'user_goals' in the schema cache" when creating goals
  - Updated habitService.ts to match the actual database schema by removing references to non-existent columns
  - Updated TypeScript types to correctly reflect the database schema (using goal_name instead of title)

## 2025-03-13
- **Added Goal Update Functionality to Home Screen**
  - Implemented the ability to update goals directly from the home screen
  - Added an "Edit" button to each goal card in the goals list
  - Created a modal dialog for editing goal details including:
    - Goal name
    - Category
    - Target value
  - Implemented form validation for goal updates
  - Added error handling and success feedback
  - Integrated with existing useGoals hook and Supabase services
  - Ensured responsive design for the modal on different screen sizes

- **Added Goal Creation from Home Screen**
  - Implemented the ability to create new goals directly from the home screen
  - Added an "Add Goal" button to the goals section header
  - Reused the onboarding screen for the goal creation flow
  - Integrated with the existing goal creation functionality
  - Added auto-refresh of goals when returning to the home screen
  - Ensured seamless navigation between home and goal creation screens
  - Fixed references to goal properties in home.tsx and onboarding.tsx to use the correct field names
  - Adjusted query parameters to use the correct column names from the Supabase database
  - Added additional error handling to better identify database schema issues
  - Implemented a new approach for determining active goals based on current_value < target_value
  - Ensured all operations (create, update, filter) use the correct column names
  - Added proper updated_at timestamp when updating goal progress
  - Improved error handling in the onboarding flow to provide better feedback

- **Enhanced Goal Display and Management**
  - Updated the home screen to display only non-completed goals (where current_value < target_value)
  - Added a dedicated section in the habits/history screen to display completed goals
  - Implemented a filter in the useEffect hook to separate completed and non-completed goals
  - Created new UI components for displaying completed goals with appropriate styling
  - Added visual indicators to distinguish completed goals from active ones
  - Ensured consistent styling between habit logs and completed goals sections
  - Improved user experience by showing appropriate empty state messages when no completed goals exist

- **Fixed Infinite API Call Loop in Home Screen**
  - Replaced the problematic useFocusEffect hook with a simpler useEffect implementation
  - Modified goal loading logic to only fetch goals once on initial component mount
  - Added a manual refresh function that can be called when needed (e.g., after goal updates)
  - Eliminated excessive API calls to Supabase that were causing performance issues
  - Improved app stability by preventing the "ERR_INSUFFICIENT_RESOURCES" errors
  - Optimized data fetching to reduce network usage and battery consumption

## 2025-03-14 (Goal Setting UI and UX Improvements)

- **Enhanced Goal Creation Flow**
  - Changed the screen name to "Goal" from "Onboarding"
  - Implemented a more streamlined goal creation process
  - Added validation for required fields (name, category, target value)
  - Added error handling and success feedback
  - Integrated with existing useGoals hook and Supabase services
  - Ensured responsive design for the modal on different screen sizes
  - Implemented proper timestamps for goal creation and updates
  - Enhanced UI components for better user experience
  - Implemented proper error handling and loading states
  - Added support for goal completion and progress tracking
  - Enhanced UI components for better user experience
  - Added support for goal deletion
  - Implemented proper error handling and loading states