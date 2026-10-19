/**
 * Layout racine : le premier composant affiché par Expo Router.
 * Il charge les polices, place les Providers (thème, puis base de données et
 * session dans les branches suivantes) et déclare la navigation en pile (Stack).
 */

import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';

// Le splash natif reste affiché tant que les polices ne sont pas prêtes :
// sans ça, on verrait un court instant le texte dans la police système.
SplashScreen.preventAutoHideAsync();

function RootStack({ fontsReady }: { fontsReady: boolean }) {
  // Ce composant est SOUS le ThemeProvider : il peut donc lire le thème.
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <>
      {/* Heure et batterie en clair sur fond sombre, et inversement. */}
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  return (
    <ThemeProvider>
      {/* En cas d'erreur de chargement, on affiche quand même l'app (avec la police système). */}
      <RootStack fontsReady={fontsLoaded || fontError != null} />
    </ThemeProvider>
  );
}
