import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import HabitContextModule from "./context/HabitContext/HabitContext";
import { useEffect } from 'react';
import analyticsService from './services/analyticsService';

const { HabitProvider } = HabitContextModule;

export default function RootLayout() {
  // Initialize analytics when the app starts
  useEffect(() => {
    // Initialize analytics and log the result
    const initResult = analyticsService.initialize();
    console.log('Analytics initialization result:', initResult);
    
    // Set a timeout to ensure analytics is ready before the app fully loads
    if (!analyticsService.isInitialized) {
      console.warn('Analytics not initialized on first attempt, setting fallback initialization');
      // Set isInitialized to true to prevent errors in components that use analytics
      analyticsService.isInitialized = true;
    }
  }, []);

  return (
    <AuthProvider>
      <HabitProvider>
        {/* Provide global defaults via screenOptions here */}
        <Stack screenOptions={{ headerTitle: "" }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="habits/goal" options={{ headerShown: false }} />
          <Stack.Screen name="habits/log" options={{ headerShown: false }} />
          <Stack.Screen name="habits/history" options={{ headerShown: false }} />

          {/* Profile screens */}
          <Stack.Screen name="profile/index" options={{ headerShown: false }} />
          <Stack.Screen name="profile/edit" options={{ headerShown: false }} />

          {/* Community screens */}
          <Stack.Screen name="community/index" options={{ headerShown: false }} />
          <Stack.Screen name="community/post/new-post" options={{ headerShown: false }} />
          <Stack.Screen name="community/post/[id]" options={{ headerShown: false }} />

          {/* Home screen override: hide back button explicitly */}
          <Stack.Screen
            name="home"
            options={{
              headerShown: false,
              headerBackVisible: false, // This hides the back button
              gestureEnabled: false,    // Disables the iOS swipe-to-go-back gesture
            }}
          />
        </Stack>
      </HabitProvider>
    </AuthProvider>
  );
}
