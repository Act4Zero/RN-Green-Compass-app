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
          <Stack.Screen name="index" options={{ headerShown: false }} />

          {/* Home screen override: hide back button explicitly */}
          <Stack.Screen
            name="home"
            options={{
              headerBackVisible: false, // This hides the back button
              gestureEnabled: false,    // Disables the iOS swipe-to-go-back gesture
            }}
          />
        </Stack>
      </HabitProvider>
    </AuthProvider>
  );
}
