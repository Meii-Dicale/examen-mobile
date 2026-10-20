import { Stack } from 'expo-router';

import { LocationProvider } from '@/context/LocationContext';
import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import { fonts } from '@/theme/tokens';

/**
 * Groupe des écrans réservés aux personnes connectées.
 * Une pile (Stack) : les onglets en dessous, et les écrans « poussés » par-dessus
 * (détail, modification) ou présentés en modale (création).
 * LocationProvider entoure la pile : la position est demandée une fois, à l'entrée dans l'app.
 */
export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <LocationProvider>
      <Stack
        screenOptions={{
          // En-tête natif aux couleurs du thème pour les écrans poussés.
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: fonts.bold, color: colors.text },
          headerShadowVisible: false,
          // Flèche seule : le libellé « Retour » serait parfois trompeur (détail ← modification).
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {/* Les onglets ont leurs propres titres : pas d'en-tête de pile. */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]/index" options={{ title: fr.eventDetail.title }} />
        <Stack.Screen name="event/[id]/edit" options={{ title: fr.eventForm.editTitle }} />
        {/* Modale : la création s'ouvre par-dessus la liste et se ferme vers le bas. */}
        <Stack.Screen name="event/new" options={{ title: fr.eventForm.newTitle, presentation: 'modal' }} />
      </Stack>
    </LocationProvider>
  );
}
