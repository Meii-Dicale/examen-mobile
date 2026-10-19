/**
 * Participations : la table `participations` relie un utilisateur à un événement.
 * Sa clé primaire (user_id, event_id) interdit de participer deux fois.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

export async function addParticipation(db: SQLiteDatabase, userId: number, eventId: number): Promise<void> {
  // OR IGNORE : un double appui ne provoque pas d'erreur, la ligne existe déjà.
  await db.runAsync('INSERT OR IGNORE INTO participations (user_id, event_id) VALUES (?, ?)', userId, eventId);
}

export async function removeParticipation(db: SQLiteDatabase, userId: number, eventId: number): Promise<void> {
  await db.runAsync('DELETE FROM participations WHERE user_id = ? AND event_id = ?', userId, eventId);
}
