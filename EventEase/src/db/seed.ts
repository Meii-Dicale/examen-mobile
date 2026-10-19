/**
 * Données de démonstration, insérées une seule fois à la création de la base.
 *
 * Deux comptes (mot de passe « demo1234 ») :
 * - demo@eventease.fr    : le compte de la soutenance ;
 * - camille@eventease.fr : une autre membre, pour montrer qu'on ne peut pas
 *   modifier ni supprimer l'événement de quelqu'un d'autre.
 *
 * Les dates sont calculées à partir d'aujourd'hui, pour qu'il y ait toujours :
 * des événements dans moins de 5 jours (météo disponible), des événements plus
 * lointains, et des événements passés auxquels le compte démo a participé (photos).
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import { createSalt, hashPassword } from '@/services/password';

const DEMO_PASSWORD = 'demo1234';

/** Date ISO dans `days` jours (négatif = dans le passé), à l'heure locale indiquée. */
function daysFromNow(days: number, hours: number, minutes = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

async function insertUser(db: SQLiteDatabase, email: string, name: string): Promise<number> {
  const salt = createSalt();
  const passwordHash = await hashPassword(DEMO_PASSWORD, salt);
  // Requête paramétrée : les « ? » sont remplacés par les valeurs, échappées par SQLite.
  const result = await db.runAsync(
    'INSERT INTO users (email, name, password_hash, salt) VALUES (?, ?, ?, ?)',
    email,
    name,
    passwordHash,
    salt,
  );
  // Id généré par AUTOINCREMENT, pour relier les événements à leur créateur.
  return result.lastInsertRowId;
}

type SeedEvent = {
  title: string;
  description: string;
  date: string;
  locationName: string;
  latitude: number;
  longitude: number;
  createdBy: number;
};

async function insertEvent(db: SQLiteDatabase, event: SeedEvent): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO events (title, description, date, location_name, latitude, longitude, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    event.title,
    event.description,
    event.date,
    event.locationName,
    event.latitude,
    event.longitude,
    event.createdBy,
  );
  return result.lastInsertRowId;
}

async function insertParticipation(db: SQLiteDatabase, userId: number, eventId: number): Promise<void> {
  await db.runAsync('INSERT INTO participations (user_id, event_id) VALUES (?, ?)', userId, eventId);
}

export async function seedDemoData(db: SQLiteDatabase): Promise<void> {
  const demo = await insertUser(db, 'demo@eventease.fr', 'Alex Martin');
  const camille = await insertUser(db, 'camille@eventease.fr', 'Camille Bernard');

  const picnic = await insertEvent(db, {
    title: 'Pique-nique de rentrée',
    description: "Chacun apporte un plat à partager. On accueille les nouveaux membres de l'association.",
    date: daysFromNow(2, 12),
    locationName: "Parc de la Tête d'Or, Lyon",
    latitude: 45.7772,
    longitude: 4.8558,
    createdBy: demo,
  });

  await insertEvent(db, {
    title: 'Atelier vélo solidaire',
    description: 'Réparation gratuite de vélos avec des bénévoles. Outils fournis, venez avec votre vélo.',
    date: daysFromNow(4, 14),
    locationName: 'Place Bellecour, Lyon',
    latitude: 45.7578,
    longitude: 4.832,
    createdBy: camille,
  });

  await insertEvent(db, {
    title: 'Collecte de vêtements',
    description: "Dépôt de vêtements chauds pour l'hiver, redistribués par une association partenaire.",
    date: daysFromNow(12, 10),
    locationName: 'Mairie du 7e arrondissement, Lyon',
    latitude: 45.7456,
    longitude: 4.8423,
    createdBy: camille,
  });

  await insertEvent(db, {
    title: 'Soirée jeux de société',
    description: 'Jeux de plateau et de cartes pour tous les âges. Boissons et gâteaux sur place.',
    date: daysFromNow(25, 19),
    locationName: 'Croix-Rousse, Lyon',
    latitude: 45.7745,
    longitude: 4.832,
    createdBy: demo,
  });

  const cleanup = await insertEvent(db, {
    title: 'Nettoyage des berges du Rhône',
    description: 'Ramassage des déchets le long des quais. Gants et sacs fournis.',
    date: daysFromNow(-6, 9, 30),
    locationName: 'Berges du Rhône, Lyon',
    latitude: 45.7597,
    longitude: 4.8422,
    createdBy: camille,
  });

  const assembly = await insertEvent(db, {
    title: 'Assemblée générale',
    description: "Bilan de l'année, vote du budget et élection du bureau.",
    date: daysFromNow(-20, 18, 30),
    locationName: 'Hôtel de Ville, Lyon',
    latitude: 45.7676,
    longitude: 4.836,
    createdBy: demo,
  });

  // Le compte démo a participé aux deux événements passés : il pourra y ajouter des photos.
  await insertParticipation(db, demo, cleanup);
  await insertParticipation(db, demo, assembly);
  // Camille participe au pique-nique : le compteur de participants n'est pas à 0.
  await insertParticipation(db, camille, picnic);
}
