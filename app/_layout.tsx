import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import HabitContextModule from "@/context/HabitContext/HabitContext";
import { BadgesProvider } from '@/context/BadgesContext';
import { useEffect } from 'react';
import analyticsService from '@/services/analyticsService';
import { FeatureFlagsProvider } from '@/context/FeatureFlagsContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { NotificationContainer } from '@/components/notifications/NotificationContainer';

const { HabitProvider } = HabitContextModule;

export default function RootLayout() {
  // Initialize analytics when the app starts
  useEffect(() => {
    // Initialize analytics and log the result
    const initResult = analyticsService.initialize();

    
    // Set a timeout to ensure analytics is ready before the app fully loads
    if (!analyticsService.isInitialized) {
      console.warn('Analytics not initialized on first attempt, setting fallback initialization');
      // Set isInitialized to true to prevent errors in components that use analytics
      analyticsService.isInitialized = true;
    }
  }, []);

  return (
    <FeatureFlagsProvider>
      <NotificationProvider>
        <AuthProvider>
          <HabitProvider>
            <BadgesProvider>
        {/* Provide global defaults via screenOptions here */}
        <Stack screenOptions={{ headerTitle: "" }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="habits/goal" options={{ headerShown: false }} />
          <Stack.Screen name="habits/log" options={{ headerShown: false }} />
          <Stack.Screen name="habits/history" options={{ headerShown: false }} />

          {/* Profile screens */}
          <Stack.Screen name="profile/index" options={{ headerShown: false }} />
          <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
          <Stack.Screen name="profile/badges/index" options={{ headerShown: false }} />

          {/* Community screens */}
          <Stack.Screen name="community/index" options={{ headerShown: false }} />
          <Stack.Screen name="community/post/new-post" options={{ headerShown: false }} />
          <Stack.Screen name="community/post/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="community/leaderboards/index" options={{ headerShown: false }} />

          {/* Challenges screens */}
          <Stack.Screen name="community/challenges/index" options={{ headerShown: false }} />
          <Stack.Screen name="community/challenges/[id]/index" options={{ headerShown: false }} />
          <Stack.Screen name="community/challenges/[id]/log" options={{ headerShown: false }} />

          {/* Map screens */}
          <Stack.Screen name="map/index" options={{ headerShown: false }} />


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
        <NotificationContainer />
            </BadgesProvider>
          </HabitProvider>
        </AuthProvider>
      </NotificationProvider>
    </FeatureFlagsProvider>
  );
}
