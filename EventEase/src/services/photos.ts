/**
 * Table `event_photos` : une ligne par photo, avec le chemin RELATIF du fichier
 * (voir services/photoFiles.ts pour la gestion des fichiers eux-mêmes).
 *
 * Sécurité : comme pour les événements, les règles sont vérifiées DANS la requête :
 * - ajouter : seulement si on a participé et que l'événement est passé ;
 * - supprimer : seulement ses propres photos.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import { NOW } from '@/db/schema';
import type { EventPhoto } from '@/types/photo';

import { photoUri } from './photoFiles';

/** Ajout refusé : pas de participation, ou événement pas encore passé. */
export class PhotoNotAllowedError extends Error {
  constructor() {
    super('photo-not-allowed');
    this.name = 'PhotoNotAllowedError';
  }
}

type PhotoRow = {
  id: number;
  event_id: number;
  user_id: number;
  author_name: string;
  uri: string;
  created_at: string;
};

function toPhoto(row: PhotoRow): EventPhoto {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    authorName: row.author_name,
    // En base : « photos/….jpg ». Pour l'affichage : l'adresse complète du fichier.
    uri: photoUri(row.uri),
    createdAt: row.created_at,
  };
}

/** Photos de l'événement, de la plus récente à la plus ancienne. */
export async function listPhotos(db: SQLiteDatabase, eventId: number): Promise<EventPhoto[]> {
  const rows = await db.getAllAsync<PhotoRow>(
    `SELECT ph.*, u.name AS author_name
     FROM event_photos ph
     JOIN users u ON u.id = ph.user_id
     WHERE ph.event_id = ?
     ORDER BY ph.created_at DESC, ph.id DESC`,
    eventId,
  );
  return rows.map(toPhoto);
}

/** Chemins des fichiers de l'événement (pour les effacer quand il est supprimé). */
export async function listPhotoPaths(db: SQLiteDatabase, eventId: number): Promise<string[]> {
  const rows = await db.getAllAsync<{ uri: string }>('SELECT uri FROM event_photos WHERE event_id = ?', eventId);
  return rows.map((row) => row.uri);
}

/**
 * Enregistre la photo. INSERT … SELECT : la ligne n'est insérée que si le SELECT
 * trouve l'événement, la participation de l'utilisateur ET une date passée.
 * Sinon, 0 ligne insérée → erreur.
 */
export async function addPhoto(db: SQLiteDatabase, userId: number, eventId: number, path: string): Promise<void> {
  const result = await db.runAsync(
    `INSERT INTO event_photos (event_id, user_id, uri)
     SELECT e.id, p.user_id, ?
     FROM events e
     JOIN participations p ON p.event_id = e.id AND p.user_id = ?
     WHERE e.id = ? AND e.date < ${NOW}`,
    path,
    userId,
    eventId,
  );
  if (result.changes === 0) throw new PhotoNotAllowedError();
}

/**
 * Supprime une photo de l'utilisateur et renvoie le chemin de son fichier (null si
 * elle n'existe pas ou n'est pas à lui). RETURNING : suppression et lecture en une requête.
 */
export async function deletePhoto(db: SQLiteDatabase, userId: number, photoId: number): Promise<string | null> {
  const row = await db.getFirstAsync<{ uri: string }>(
    'DELETE FROM event_photos WHERE id = ? AND user_id = ? RETURNING uri',
    photoId,
    userId,
  );
  return row?.uri ?? null;
}
