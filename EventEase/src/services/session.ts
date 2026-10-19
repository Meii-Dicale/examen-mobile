/**
 * Session : on retient l'id de l'utilisateur connecté entre deux lancements.
 *
 * SecureStore (Keychain sur iOS, Keystore sur Android) plutôt qu'AsyncStorage :
 * la donnée est chiffrée par le système. AsyncStorage, en clair, sert aux
 * préférences sans enjeu (le thème). Repris de YouAreTheHero (tokenStorage.ts).
 */

import * as SecureStore from 'expo-secure-store';

// SecureStore n'accepte que lettres, chiffres, « . », « - » et « _ » dans une clé.
const SESSION_KEY = 'eventease.session-user-id';

/** Id enregistré, ou null si personne n'est connecté (ou stockage illisible). */
export async function loadSessionUserId(): Promise<number | null> {
  try {
    const value = await SecureStore.getItemAsync(SESSION_KEY);
    const id = value ? Number(value) : NaN;
    return Number.isInteger(id) ? id : null;
  } catch {
    return null;
  }
}

export async function saveSessionUserId(id: number): Promise<void> {
  // SecureStore ne stocke que des chaînes.
  await SecureStore.setItemAsync(SESSION_KEY, String(id));
}

export async function clearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch {
    // Rien à effacer : la déconnexion doit réussir quand même.
  }
}
