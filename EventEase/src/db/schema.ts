/**
 * Création et évolution de la base SQLite (fichier « eventease.db » sur le téléphone).
 *
 * Principe des migrations : SQLite garde un numéro de version dans
 * `PRAGMA user_version` (0 pour une base neuve). Chaque case du tableau
 * MIGRATIONS fait passer la base à la version suivante. Au démarrage, on joue
 * uniquement celles qui manquent : une base déjà à jour ne bouge pas, et on ne
 * perd jamais les données existantes.
 *
 * Pour modifier le schéma plus tard (ex. : ajouter une colonne), on n'édite pas
 * la migration 1 : on AJOUTE une migration 2 à la fin du tableau.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import { seedDemoData } from './seed';

export const DATABASE_NAME = 'eventease.db';

// Date courante au format ISO 8601 (ex. 2026-10-19T08:30:00.000Z), calculée par SQLite.
const NOW = "(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))";

const MIGRATIONS: ((db: SQLiteDatabase) => Promise<void>)[] = [
  // Version 1 : les quatre tables, puis les données de démonstration.
  async (db) => {
    await db.execAsync(`
      CREATE TABLE users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        -- COLLATE NOCASE : « Demo@EventEase.fr » et « demo@eventease.fr » sont le même e-mail.
        email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
        name          TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        salt          TEXT NOT NULL,
        created_at    TEXT NOT NULL DEFAULT ${NOW}
      );

      CREATE TABLE events (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        title         TEXT NOT NULL,
        description   TEXT NOT NULL,
        -- Date et heure de l'événement, en ISO 8601 : l'ordre alphabétique est aussi l'ordre chronologique.
        date          TEXT NOT NULL,
        location_name TEXT,
        -- Coordonnées calculées à partir du lieu (géocodage). NULL si le lieu est introuvable.
        latitude      REAL,
        longitude     REAL,
        -- Si l'utilisateur est supprimé, ses événements le sont aussi.
        created_by    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at    TEXT NOT NULL DEFAULT ${NOW},
        updated_at    TEXT NOT NULL DEFAULT ${NOW}
      );
      -- La liste est triée par date : l'index évite de parcourir toute la table.
      CREATE INDEX idx_events_date ON events(date);

      -- Table de liaison « qui participe à quoi » (relation plusieurs-à-plusieurs).
      CREATE TABLE participations (
        user_id                  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id                 INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        -- Id de l'événement créé dans l'agenda du téléphone (expo-calendar), pour éviter les doublons.
        device_calendar_event_id TEXT,
        created_at               TEXT NOT NULL DEFAULT ${NOW},
        -- Clé composée : on ne peut participer qu'une fois au même événement.
        PRIMARY KEY (user_id, event_id)
      );

      CREATE TABLE event_photos (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        -- Chemin du fichier copié dans le dossier de l'app.
        uri        TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT ${NOW}
      );
    `);
    // Le compte démo sert pour la soutenance (voir seed.ts).
    await seedDemoData(db);
  },
];

/** Appelée par <SQLiteProvider onInit> avant d'afficher l'app. */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  // Réglages à refaire à CHAQUE ouverture (ils ne sont pas enregistrés dans le fichier) :
  // - WAL : écritures plus rapides, lectures possibles pendant une écriture ;
  // - foreign_keys : SQLite ne vérifie les clés étrangères (et ON DELETE CASCADE)
  //   que si on l'active explicitement.
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  while (version < MIGRATIONS.length) {
    const migrate = MIGRATIONS[version];
    // Transaction : si une instruction échoue, tout est annulé et la base reste
    // dans sa version précédente, jamais à moitié migrée.
    await db.withTransactionAsync(async () => {
      await migrate(db);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
    version += 1;
  }
}
