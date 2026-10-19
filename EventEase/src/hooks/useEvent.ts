import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useCurrentUserId } from '@/context/AuthContext';
import { getEvent } from '@/services/events';

import { useFocusQuery } from './useFocusQuery';

/** Un seul événement (détail, modification). `data` vaut null s'il n'existe pas ou plus. */
export function useEvent(id: number) {
  const userId = useCurrentUserId();
  // useCallback : la requête ne change que si l'id (ou l'utilisateur) change.
  const query = useCallback((db: SQLiteDatabase) => getEvent(db, userId, id), [userId, id]);
  return useFocusQuery(query);
}
