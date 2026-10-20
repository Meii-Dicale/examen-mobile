/**
 * Distance entre deux points GPS, avec la formule de Haversine.
 *
 * La Terre est assimilée à une sphère de rayon 6 371 km. On calcule la distance
 * « à vol d'oiseau » sur la surface (un arc de cercle), pas le trajet par la route.
 * Erreur < 0,5 % : largement suffisant pour « à 2,3 km ».
 */

import type { Coordinates } from '@/types/location';

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Distance en kilomètres entre `a` et `b`. */
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  // h = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  // Angle au centre de la Terre (en radians) × rayon = longueur de l'arc.
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Distance jusqu'à un lieu dont les coordonnées peuvent manquer (lieu non géocodé).
 * null si l'une des deux positions est inconnue : l'écran n'affiche alors rien.
 */
export function distanceKm(
  from: Coordinates | null,
  to: { latitude: number | null; longitude: number | null },
): number | null {
  if (!from || to.latitude == null || to.longitude == null) return null;
  return haversineKm(from, { latitude: to.latitude, longitude: to.longitude });
}

/** « 350 m », « 2,3 km », « 12 km » : la précision diminue avec la distance. */
export function formatDistance(km: number): string {
  // Moins d'1 km : en mètres, arrondi à la dizaine (la position n'est pas plus précise).
  if (km < 1) return `${Math.max(10, Math.round(km * 100) * 10)} m`;
  // toLocaleString('fr-FR') : virgule décimale et espace pour les milliers.
  const digits = km < 10 ? 1 : 0;
  return `${km.toLocaleString('fr-FR', { maximumFractionDigits: digits })} km`;
}
