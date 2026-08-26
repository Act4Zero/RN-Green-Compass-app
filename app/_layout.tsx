import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import HabitContextModule from "@/context/HabitContext/HabitContext";
import { BadgesProvider } from '@/context/BadgesContext';
import { useEffect } from 'react';
import analyticsService from '@/services/analyticsService';
import { FeatureFlagsProvider } from '@/context/FeatureFlagsContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { NotificationContainer } from '@/components/notifications/NotificationContainer';
import PointsProvider from '@/context/PointsContext';
import { ThemeProvider } from '@/theme';
import { AppShell } from '@/components/navigation/AppShell';
import { KnowledgeLocaleProvider } from '@/features/knowledge';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';

const { HabitProvider } = HabitContextModule;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  // Initialize analytics when the app starts
  useEffect(() => {
    // Initialize analytics and log the result
    analyticsService.initialize();

    
    // Set a timeout to ensure analytics is ready before the app fully loads
    if (!analyticsService.isInitialized) {
      console.warn('Analytics not initialized on first attempt, setting fallback initialization');
      // Set isInitialized to true to prevent errors in components that use analytics
      analyticsService.isInitialized = true;
    }
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
    <FeatureFlagsProvider>
      <NotificationProvider>
        <KnowledgeLocaleProvider>
        <AuthProvider>
          <HabitProvider>
            <PointsProvider>
            <BadgesProvider>
        <AppShell>
        {/* Provide global defaults via screenOptions here */}
        <Stack screenOptions={{ headerTitle: "" }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="habits/index" options={{ headerShown: false }} />
          <Stack.Screen name="habits/goal" options={{ headerShown: false }} />
          <Stack.Screen name="habits/log" options={{ headerShown: false }} />
          <Stack.Screen name="habits/history" options={{ headerShown: false }} />
          <Stack.Screen name="habits/identity" options={{ headerShown: false }} />
          <Stack.Screen name="habits/today" options={{ headerShown: false }} />
          <Stack.Screen name="habits/impact" options={{ headerShown: false }} />
          <Stack.Screen name="habits/travel" options={{ headerShown: false }} />

          {/* Profile screens */}
          <Stack.Screen name="profile/index" options={{ headerShown: false }} />
          <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
          <Stack.Screen name="profile/badges/index" options={{ headerShown: false }} />

          {/* Community screens */}
          <Stack.Screen name="community/index" options={{ headerShown: false }} />
          <Stack.Screen name="community/post/new-post" options={{ headerShown: false }} />
          <Stack.Screen name="community/post/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="community/leaderboards/index" options={{ headerShown: false }} />
          <Stack.Screen name="community/groups/index" options={{ headerShown: false }} />
          <Stack.Screen name="community/groups/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="community/projects/index" options={{ headerShown: false }} />
          <Stack.Screen name="community/contribute" options={{ headerShown: false }} />
          <Stack.Screen name="community/rewards" options={{ headerShown: false }} />

          {/* Challenges screens */}
          <Stack.Screen name="community/challenges/index" options={{ headerShown: false }} />
          <Stack.Screen name="community/challenges/[id]/index" options={{ headerShown: false }} />
          <Stack.Screen name="community/challenges/[id]/log" options={{ headerShown: false }} />

          {/* Map screens */}
          <Stack.Screen name="map/index" options={{ headerShown: false }} />

          {/* Knowledge Hub screens */}
          <Stack.Screen name="knowledge/index" options={{ headerShown: false }} />
          <Stack.Screen name="knowledge/search" options={{ headerShown: false }} />
          <Stack.Screen name="knowledge/topic/[slug]" options={{ headerShown: false }} />
          <Stack.Screen name="knowledge/content/[slug]" options={{ headerShown: false }} />
          <Stack.Screen name="knowledge/quiz/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="knowledge/downloads" options={{ headerShown: false }} />
          <Stack.Screen name="knowledge/daily" options={{ headerShown: false }} />
          <Stack.Screen name="knowledge/path/[slug]" options={{ headerShown: false }} />
          <Stack.Screen name="knowledge/tour/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="knowledge/simulation/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="knowledge/webinar/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="knowledge/certificate/[code]" options={{ headerShown: false }} />
          <Stack.Screen name="admin/knowledge/index" options={{ headerShown: false }} />
          <Stack.Screen name="admin/community/index" options={{ headerShown: false }} />


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
        </AppShell>
        <NotificationContainer />
            </BadgesProvider>
            </PointsProvider>
          </HabitProvider>
        </AuthProvider>
        </KnowledgeLocaleProvider>
      </NotificationProvider>
    </FeatureFlagsProvider>
    </ThemeProvider>
  );
}
