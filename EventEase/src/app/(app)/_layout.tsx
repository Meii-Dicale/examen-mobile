import { Stack } from 'expo-router';

/**
 * Groupe des écrans réservés aux personnes connectées.
 * Une pile (Stack) qui contient les onglets ; les écrans « poussés » par-dessus
 * (détail, création d'événement) y seront ajoutés dans feat/events-crud.
 */
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
