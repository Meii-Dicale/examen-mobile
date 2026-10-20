/**
 * Layout racine : le premier composant affiché par Expo Router.
 * Il place les Providers (base de données, thème, session), charge les polices
 * et choisit les écrans accessibles selon que quelqu'un est connecté ou non.
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
import { useCallback, useEffect, useState } from 'react';

import { AnimatedSplash } from '@/components/common/AnimatedSplash';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/db/schema';

// Le splash natif reste affiché tant que les polices ne sont pas prêtes :
// sans ça, on verrait un court instant le texte dans la police système.
SplashScreen.preventAutoHideAsync();

/**
 * Les polices et la session sont attendues ICI, sous <SQLiteProvider>, et pas dans RootLayout.
 * Raison : SQLiteProvider est mémoïsé (React.memo) et ne se re-rend que si ses
 * propres props changent (databaseName, onInit…), pas ses enfants. Si l'état
 * « polices chargées » ou « session restaurée » vivait au-dessus de lui, la mise à jour ne descendrait
 * jamais jusqu'ici et l'app resterait bloquée sur le splash.
 */
function RootStack() {
  // Ce composant est SOUS le ThemeProvider : il peut donc lire le thème.
  const { colors, isDark } = useTheme();
  const { user, isLoading } = useAuth();
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });
  // En cas d'erreur de chargement, on affiche quand même l'app (avec la police système).
  const fontsReady = fontsLoaded || fontError != null;
  // On attend aussi la session : sinon l'écran de connexion clignoterait
  // une fraction de seconde avant d'afficher l'app d'une personne déjà connectée.
  const ready = fontsReady && !isLoading;
  // Splash animé (JavaScript) : il prend le relais du splash natif, puis s'efface.
  const [splashDone, setSplashDone] = useState(false);
  const hideSplash = useCallback(() => setSplashDone(true), []);

  useEffect(() => {
    // Le splash natif se cache au moment où le splash animé, de même couleur, s'affiche.
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      {/* Heure et batterie en clair sur fond sombre, et inversement. */}
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        {/*
          Stack.Protected : un groupe n'existe que si sa condition (guard) est vraie.
          Quand `user` change (connexion, déconnexion), Expo Router bascule tout seul
          vers le groupe devenu accessible : aucun router.replace dans les écrans.
        */}
        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
      {/* Dessiné APRÈS la Stack : il est au-dessus, le temps de s'effacer. */}
      {splashDone ? null : <AnimatedSplash onFinish={hideSplash} />}
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
        {/* AuthProvider lit la base : il doit être sous SQLiteProvider. */}
        <AuthProvider>
          <RootStack />
        </AuthProvider>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
