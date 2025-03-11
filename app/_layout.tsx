import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import HabitContextModule from "./context/HabitContext/HabitContext";

const { HabitProvider } = HabitContextModule;

export default function RootLayout() {
  return (
    <AuthProvider>
      <HabitProvider>
        <Stack screenOptions={{ headerTitle: "" }} />
      </HabitProvider>
    </AuthProvider>
  );
}
