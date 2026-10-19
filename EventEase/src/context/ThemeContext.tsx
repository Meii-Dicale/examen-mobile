/**
 * Contexte du thème clair / sombre, repris du Pokédex.
 *
 * Un Context évite de passer `colors` en props à chaque composant :
 * n'importe quel composant sous <ThemeProvider> appelle `useTheme()`.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { loadColorScheme, saveColorScheme } from '@/services/preferences';
import { palettes, type ColorScheme, type ThemeColors } from '@/theme/colors';

type ThemeContextValue = {
  scheme: ColorScheme;
  isDark: boolean;
  colors: ThemeColors;
  toggleScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Thème réglé dans le téléphone ('light', 'dark' ou null).
  const systemScheme = useColorScheme();
  // null tant que l'utilisateur n'a rien choisi : on suit alors le téléphone.
  const [preference, setPreference] = useState<ColorScheme | null>(null);

  // Au démarrage, on relit le choix enregistré lors d'une session précédente.
  useEffect(() => {
    loadColorScheme()
      .then((saved) => {
        if (saved) setPreference(saved);
      })
      // Stockage illisible : on garde simplement le thème du téléphone.
      .catch(() => {});
  }, []);

  const scheme: ColorScheme = preference ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const toggleScheme = () => {
    const next = scheme === 'dark' ? 'light' : 'dark';
    setPreference(next);
    // Sauvegarde en arrière-plan : l'écran change tout de suite, sans attendre.
    saveColorScheme(next).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ scheme, isDark: scheme === 'dark', colors: palettes[scheme], toggleScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  // Erreur explicite si on oublie le Provider, plutôt qu'un plantage obscur plus loin.
  if (!context) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
}
