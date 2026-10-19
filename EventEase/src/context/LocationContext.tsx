/**
 * Position de la personne connectée, partagée par tous les écrans.
 *
 * Pourquoi un Context ? La liste, le calendrier, le profil et le détail affichent
 * tous des distances. Sans Context, chaque carte demanderait la position au GPS.
 * Ici, on la demande UNE fois, à l'arrivée dans l'app, et tout le monde la lit
 * avec `useUserPosition()`.
 *
 * Le Provider est placé dans le layout (app) : la permission n'est donc demandée
 * qu'après la connexion, quand on voit les événements, pas sur l'écran de connexion.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { getUserPosition } from '@/services/location';
import type { Coordinates } from '@/types/location';

/** null tant que la position n'est pas connue, ou si elle n'est pas disponible. */
const LocationContext = createContext<Coordinates | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<Coordinates | null>(null);

  useEffect(() => {
    let cancelled = false;
    // getUserPosition ne lève jamais d'erreur : null si refus ou GPS indisponible.
    getUserPosition().then((result) => {
      if (!cancelled) setPosition(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <LocationContext.Provider value={position}>{children}</LocationContext.Provider>;
}

/** Position actuelle, ou null : dans ce cas, on masque simplement les distances. */
export function useUserPosition(): Coordinates | null {
  return useContext(LocationContext);
}
