import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import HabitContextModule from "./context/HabitContext/HabitContext";

const { HabitProvider } = HabitContextModule;

export default function RootLayout() {
  return (
    <AuthProvider>
      <HabitProvider>
        {/* Provide global defaults via screenOptions here */}
        <Stack screenOptions={{ headerTitle: "" }}>
          {/* Home screen override: hide back button explicitly */}
          <Stack.Screen
            name="home"
            options={{
              headerBackVisible: false, // This hides the back button
              gestureEnabled: false,    // Disables the iOS swipe-to-go-back gesture
            }}
          />

          {/* Let everything else remain the default (headerTitle is blank, etc.) */}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="any-other-route" />
        </Stack>
      </HabitProvider>
    </AuthProvider>
  );
}
