/**
 * Accès à la table `events` : lecture, création, modification, suppression.
 *
 * Sécurité : la modification et la suppression vérifient AUSSI dans la requête
 * que l'utilisateur est le créateur (`AND created_by = ?`). Masquer les boutons
 * dans l'écran ne suffit pas : la règle est garantie au niveau des données.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import { NOW } from '@/db/schema';
import type { Event, EventInput } from '@/types/event';

/** L'événement n'existe pas, ou l'utilisateur n'en est pas le créateur. */
export class EventNotFoundError extends Error {
  constructor() {
    super('event-not-found');
    this.name = 'EventNotFoundError';
  }
}

type EventRow = {
  id: number;
  title: string;
  description: string;
  date: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  created_by: number;
  creator_name: string;
  created_at: string;
  updated_at: string;
};

function toEvent(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    locationName: row.location_name,
    latitude: row.latitude,
    longitude: row.longitude,
    createdBy: row.created_by,
    creatorName: row.creator_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Jointure avec `users` pour afficher « Organisé par … » sans seconde requête.
const SELECT_EVENTS = `
  SELECT e.*, u.name AS creator_name
  FROM events e
  JOIN users u ON u.id = e.created_by
`;

/** Tous les événements, par date croissante (les dates ISO se trient comme du texte). */
export async function listEvents(db: SQLiteDatabase): Promise<Event[]> {
  const rows = await db.getAllAsync<EventRow>(`${SELECT_EVENTS} ORDER BY e.date ASC`);
  return rows.map(toEvent);
}

export async function getEvent(db: SQLiteDatabase, id: number): Promise<Event | null> {
  const row = await db.getFirstAsync<EventRow>(`${SELECT_EVENTS} WHERE e.id = ?`, id);
  return row ? toEvent(row) : null;
}

/** Crée l'événement et renvoie son id. */
export async function createEvent(db: SQLiteDatabase, userId: number, input: EventInput): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO events (title, description, date, location_name, created_by) VALUES (?, ?, ?, ?, ?)',
    input.title.trim(),
    input.description.trim(),
    input.date,
    input.locationName?.trim() || null,
    userId,
  );
  return result.lastInsertRowId;
}

export async function updateEvent(db: SQLiteDatabase, userId: number, id: number, input: EventInput): Promise<void> {
  const result = await db.runAsync(
    `UPDATE events
     SET title = ?, description = ?, date = ?, location_name = ?, updated_at = ${NOW}
     WHERE id = ? AND created_by = ?`,
    input.title.trim(),
    input.description.trim(),
    input.date,
    input.locationName?.trim() || null,
    id,
    userId,
  );
  // `changes` = nombre de lignes modifiées : 0 si l'id est faux ou si ce n'est pas le créateur.
  if (result.changes === 0) throw new EventNotFoundError();
}

/** Supprime l'événement ; ses participations et photos partent avec (ON DELETE CASCADE). */
export async function deleteEvent(db: SQLiteDatabase, userId: number, id: number): Promise<void> {
  const result = await db.runAsync('DELETE FROM events WHERE id = ? AND created_by = ?', id, userId);
  if (result.changes === 0) throw new EventNotFoundError();
}
