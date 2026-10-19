import type { SQLiteDatabase } from 'expo-sqlite';

export type DatabaseSummary = {
  users: number;
  events: number;
  participations: number;
};

/** Nombre de lignes de chaque table : permet de vérifier que la base et le seed fonctionnent. */
export async function getDatabaseSummary(db: SQLiteDatabase): Promise<DatabaseSummary> {
  // Une seule requête avec trois sous-requêtes COUNT(*).
  const row = await db.getFirstAsync<DatabaseSummary>(`
    SELECT
      (SELECT COUNT(*) FROM users)          AS users,
      (SELECT COUNT(*) FROM events)         AS events,
      (SELECT COUNT(*) FROM participations) AS participations
  `);
  return row ?? { users: 0, events: 0, participations: 0 };
}
