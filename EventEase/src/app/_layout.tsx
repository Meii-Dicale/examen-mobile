/**
 * Layout racine : le premier composant affiché par Expo Router.
 * Il place les Providers (base de données, thème, puis session dans une branche
 * suivante), charge les polices et déclare la navigation en pile (Stack).
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
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/db/schema';

// Le splash natif reste affiché tant que les polices ne sont pas prêtes :
// sans ça, on verrait un court instant le texte dans la police système.
SplashScreen.preventAutoHideAsync();

/**
 * Les polices sont chargées ICI, sous <SQLiteProvider>, et pas dans RootLayout.
 * Raison : SQLiteProvider est mémoïsé (React.memo) et ne se re-rend que si ses
 * propres props changent (databaseName, onInit…), pas ses enfants. Si l'état
 * « polices chargées » vivait au-dessus de lui, la mise à jour ne descendrait
 * jamais jusqu'ici et l'app resterait bloquée sur le splash.
 */
function RootStack() {
  // Ce composant est SOUS le ThemeProvider : il peut donc lire le thème.
  const { colors, isDark } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });
  // En cas d'erreur de chargement, on affiche quand même l'app (avec la police système).
  const fontsReady = fontsLoaded || fontError != null;

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
  return (
    // SQLiteProvider ouvre la base, joue les migrations (onInit), puis seulement
    // affiche ses enfants : aucun écran ne peut lire une base pas encore prête.
    // Pendant ce temps, le splash natif reste affiché.
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </SQLiteProvider>
  );
}
