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

/**
 * Enregistre (ou efface avec null) l'id de l'événement créé dans l'agenda du téléphone.
 * La ligne n'existe que si l'utilisateur participe : sans participation, rien n'est modifié.
 */
export async function setDeviceCalendarEventId(
  db: SQLiteDatabase,
  userId: number,
  eventId: number,
  deviceCalendarEventId: string | null,
): Promise<void> {
  await db.runAsync(
    'UPDATE participations SET device_calendar_event_id = ? WHERE user_id = ? AND event_id = ?',
    deviceCalendarEventId,
    userId,
    eventId,
  );
}
