/**
 * Localisation (expo-location) : position du téléphone et géocodage des lieux.
 *
 * Tout échec renvoie `null` au lieu de lever une erreur : la distance est un
 * « plus ». Permission refusée, GPS coupé ou pas de réseau → on ne l'affiche
 * pas, et le reste de l'app fonctionne normalement.
 */

import * as Location from 'expo-location';
import { Platform } from 'react-native';

import type { Coordinates } from '@/types/location';

/** Une position de moins de 5 minutes est assez précise pour une distance en km. */
const LAST_KNOWN_MAX_AGE_MS = 5 * 60 * 1000;

/**
 * Demande la permission « pendant l'utilisation de l'app » (premier plan seulement :
 * l'app n'a jamais besoin de suivre la personne en arrière-plan).
 * La fenêtre système ne s'affiche qu'une fois ; ensuite la réponse est immédiate.
 */
async function requestPermission(): Promise<boolean> {
  const { granted } = await Location.requestForegroundPermissionsAsync();
  return granted;
}

/** Position actuelle du téléphone, ou null (refus, GPS indisponible…). */
export async function getUserPosition(): Promise<Coordinates | null> {
  try {
    if (!(await requestPermission())) return null;
    // La dernière position connue est instantanée ; sinon on en demande une nouvelle.
    // Précision « Balanced » (~100 m) : suffisant pour une distance, et plus rapide que le GPS fin.
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch {
    return null;
  }
}

/**
 * Coordonnées d'un lieu saisi en texte (« Place Bellecour, Lyon »), ou null si
 * le lieu est introuvable. Utilise le géocodeur du système (Apple ou Google),
 * sans clé d'API, mais il faut du réseau.
 */
export async function geocodePlace(place: string): Promise<Coordinates | null> {
  try {
    // Sur Android, le géocodage exige la permission de localisation (pas sur iOS).
    if (Platform.OS === 'android' && !(await requestPermission())) return null;
    // Plusieurs résultats possibles : le premier est le plus pertinent.
    const [first] = await Location.geocodeAsync(place);
    return first ? { latitude: first.latitude, longitude: first.longitude } : null;
  } catch {
    return null;
  }
}

/**
 * Description lisible d'un point (« Lyon, France »), par géocodage inverse.
 * Sert à montrer dans le formulaire le lieu que le géocodeur a COMPRIS : il ne répond
 * presque jamais « introuvable » et renvoie souvent le lieu le plus ressemblant,
 * parfois à l'autre bout du monde. Seul l'utilisateur peut juger si c'est le bon.
 */
export async function describePlace(coords: Coordinates): Promise<string | null> {
  try {
    const [address] = await Location.reverseGeocodeAsync(coords);
    if (!address) return null;
    const town = address.city ?? address.subregion ?? address.region;
    // filter(Boolean) retire les morceaux absents (null).
    return [town, address.country].filter(Boolean).join(', ') || null;
  } catch {
    return null;
  }
}
