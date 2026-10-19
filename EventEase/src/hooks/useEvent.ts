import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { getEvent } from '@/services/events';

import { useFocusQuery } from './useFocusQuery';

/** Un seul événement (détail, modification). `data` vaut null s'il n'existe pas ou plus. */
export function useEvent(id: number) {
  // useCallback : la requête ne change que si l'id change.
  const query = useCallback((db: SQLiteDatabase) => getEvent(db, id), [id]);
  return useFocusQuery(query);
}
