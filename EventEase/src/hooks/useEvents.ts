import { listEvents } from '@/services/events';

import { useFocusQuery } from './useFocusQuery';

/** Tous les événements, rechargés à chaque retour sur l'écran. */
export function useEvents() {
  // listEvents est une fonction du module : elle est stable, pas besoin de useCallback.
  return useFocusQuery(listEvents);
}
