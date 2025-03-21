import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import HabitContextModule from "./context/HabitContext/HabitContext";
import { useEffect } from 'react';
import analyticsService from './services/analyticsService';

const { HabitProvider } = HabitContextModule;

export default function RootLayout() {
  // Initialize analytics when the app starts
  useEffect(() => {
    analyticsService.initialize();
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
