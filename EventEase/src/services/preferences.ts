/**
 * Préférences de l'utilisateur stockées avec AsyncStorage (clé / valeur, non chiffré).
 * Les données métier (utilisateurs, événements) sont dans SQLite ; ici on ne garde
 * que des réglages d'affichage, sans importance pour la sécurité.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ColorScheme } from '@/theme/colors';

const COLOR_SCHEME_KEY = 'eventease:color-scheme';

/** Thème choisi par l'utilisateur, ou null s'il n'a jamais choisi (on suit alors le téléphone). */
export async function loadColorScheme(): Promise<ColorScheme | null> {
  const value = await AsyncStorage.getItem(COLOR_SCHEME_KEY);
  // On vérifie la valeur lue : le stockage pourrait contenir autre chose.
  return value === 'light' || value === 'dark' ? value : null;
}

export async function saveColorScheme(scheme: ColorScheme): Promise<void> {
  await AsyncStorage.setItem(COLOR_SCHEME_KEY, scheme);
}
