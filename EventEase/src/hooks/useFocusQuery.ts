/**
 * Hook générique de lecture en base, sur le modèle { data, loading, error, reload }.
 * useEvents, useEvent (et ceux des branches suivantes) ne font que l'appeler
 * avec leur requête : la logique de chargement n'est écrite qu'une fois.
 *
 * useFocusEffect (et pas useEffect) : la requête est relancée à chaque fois que
 * l'écran revient au premier plan. Après une création ou une modification,
 * le retour sur la liste suffit donc à la rafraîchir.
 *
 * ⚠️ `query` doit être stable (fonction du module, ou useCallback) : sinon elle
 * changerait à chaque rendu et la requête serait relancée en boucle.
 */

import { useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useState } from 'react';

export function useFocusQuery<T>(query: (db: SQLiteDatabase) => Promise<T>) {
  const db = useSQLiteContext();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // `isCancelled` permet d'ignorer une réponse arrivée après que l'écran a perdu le focus.
  const load = useCallback(
    async (isCancelled: () => boolean) => {
      setLoading(true);
      setError(null);
      try {
        const result = await query(db);
        if (!isCancelled()) setData(result);
      } catch (e) {
        if (!isCancelled()) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [db, query],
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      load(() => cancelled);
      // Nettoyage : appelé quand l'écran perd le focus ou est démonté.
      return () => {
        cancelled = true;
      };
    }, [load]),
  );

  // Rechargement à la demande (tirer pour rafraîchir, bouton « Réessayer »).
  const reload = useCallback(() => {
    load(() => false);
  }, [load]);

  return { data, loading, error, reload };
}
