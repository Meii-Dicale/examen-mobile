/**
 * Hook TEMPORAIRE pour la vitrine (supprimé avec elle dans feat/auth).
 * Il montre déjà le modèle de tous les hooks de l'app, repris du Pokédex :
 * l'écran appelle le hook → le hook appelle le service → le service fait le SQL.
 * Il renvoie toujours { data, loading, error, reload }.
 */

import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { getDatabaseSummary, type DatabaseSummary } from '@/services/stats';

export function useDatabaseSummary() {
  // La base ouverte par <SQLiteProvider>, partagée par toute l'app.
  const db = useSQLiteContext();
  const [data, setData] = useState<DatabaseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Incrémenter cette clé relance le useEffect (rechargement à la demande).
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Si l'écran est quitté avant la fin de la requête, on n'écrit plus dans l'état.
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const summary = await getDatabaseSummary(db);
        if (!cancelled) setData(summary);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [db, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  return { data, loading, error, reload };
}
