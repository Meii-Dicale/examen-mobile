import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useCurrentUserId } from '@/context/AuthContext';
import { listEvents } from '@/services/events';

import { useFocusQuery } from './useFocusQuery';

/** Tous les événements, rechargés à chaque retour sur l'écran. */
export function useEvents() {
  const userId = useCurrentUserId();
  // useCallback : la requête ne change que si l'utilisateur change.
  const query = useCallback((db: SQLiteDatabase) => listEvents(db, userId), [userId]);
  return useFocusQuery(query);
}

/** Les événements auxquels l'utilisateur connecté participe (onglet Profil). */
export function useMyParticipations() {
  const userId = useCurrentUserId();
  const query = useCallback(
    (db: SQLiteDatabase) => listEvents(db, userId, { onlyParticipating: true }),
    [userId],
  );
  return useFocusQuery(query);
}
