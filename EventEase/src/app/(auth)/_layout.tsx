import { Stack } from 'expo-router';

/** Groupe des écrans accessibles sans être connecté·e : connexion et inscription. */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
