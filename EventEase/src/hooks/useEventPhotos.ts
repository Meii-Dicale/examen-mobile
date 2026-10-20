import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { listPhotos } from '@/services/photos';

import { useFocusQuery } from './useFocusQuery';

/** Photos d'un événement, rechargées à chaque retour sur l'écran. */
export function useEventPhotos(eventId: number) {
  const query = useCallback((db: SQLiteDatabase) => listPhotos(db, eventId), [eventId]);
  return useFocusQuery(query);
}
