/**
 * Layout racine : le premier composant affiché par Expo Router.
 * Il charge les polices, place les Providers (base de données, thème, puis
 * session dans une branche suivante) et déclare la navigation en pile (Stack).
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
import { useEffect, useState } from 'react';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/db/schema';

// Le splash natif reste affiché tant que les polices ne sont pas prêtes :
// sans ça, on verrait un court instant le texte dans la police système.
SplashScreen.preventAutoHideAsync();

/**
 * Au-delà de ce délai, on affiche l'app même si les polices ne sont pas arrivées.
 * En développement, Expo Go télécharge les polices depuis l'ordinateur : sur un
 * Wi-Fi saturé, ça peut ne jamais aboutir, et l'app resterait sur un écran blanc.
 */
const FONT_TIMEOUT_MS = 5000;

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
  const [fontsTimedOut, setFontsTimedOut] = useState(false);

  // Minuteur de secours, annulé si l'écran est démonté avant la fin.
  useEffect(() => {
    const timer = setTimeout(() => setFontsTimedOut(true), FONT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsTimedOut && !fontsLoaded) {
      console.warn('[fonts] Montserrat pas encore chargée : affichage avec la police du système.');
    }
  }, [fontsTimedOut, fontsLoaded]);

  // On continue si les polices sont là, en cas d'erreur, ou après le délai de secours.
  const fontsReady = fontsLoaded || fontError != null || fontsTimedOut;

  return (
    // SQLiteProvider ouvre la base, joue les migrations (onInit), puis seulement
    // affiche ses enfants : aucun écran ne peut lire une base pas encore prête.
    // Pendant ce temps, le splash natif reste affiché.
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
      <ThemeProvider>
        <RootStack fontsReady={fontsReady} />
      </ThemeProvider>
    </SQLiteProvider>
  );
}
