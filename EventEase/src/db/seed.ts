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
 *
 * Les événements sont volontairement humoristiques, pour une démo plus vivante.
 * Le seed ne tourne qu'à la création de la base : pour voir une modification,
 * il faut repartir d'une base neuve (supprimer les données de l'app ou d'Expo Go).
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
    title: 'Pique-nique sans fourmis (on essaie)',
    description:
      "Chacun apporte un plat à partager. Les fourmis n'ont pas été invitées, mais elles viennent tous les ans.",
    date: daysFromNow(2, 12),
    locationName: "Parc de la Tête d'Or, Lyon",
    latitude: 45.7772,
    longitude: 4.8558,
    createdBy: demo,
  });

  await insertEvent(db, {
    title: 'Championnat de lancer de chaussettes orphelines',
    description:
      'Ramène tes chaussettes sans partenaire. Record à battre : 14 mètres, vent dans le dos. Elles finissent ensuite à la ressourcerie.',
    date: daysFromNow(4, 14),
    locationName: 'Place Bellecour, Lyon',
    latitude: 45.7578,
    longitude: 4.832,
    createdBy: camille,
  });

  await insertEvent(db, {
    title: 'Atelier : plier un drap-housse',
    description:
      'Enfin la vérité sur le pliage du drap-housse. Deux bénévoles expérimentés, aucune garantie de résultat.',
    date: daysFromNow(12, 10),
    locationName: 'Mairie du 7e arrondissement, Lyon',
    latitude: 45.7456,
    longitude: 4.8423,
    createdBy: camille,
  });

  await insertEvent(db, {
    title: 'Soirée Monopoly sans dispute',
    description:
      'Objectif : finir une partie sans fâcher personne. Une médiatrice est présente, les billets sont comptés à l’avance.',
    date: daysFromNow(25, 19),
    locationName: 'Croix-Rousse, Lyon',
    latitude: 45.7745,
    longitude: 4.832,
    createdBy: demo,
  });

  const cleanup = await insertEvent(db, {
    title: 'Chasse au trésor sur les berges du Rhône',
    description:
      "On ramasse les déchets le long des quais. Un trophée récompense la trouvaille la plus improbable (l'an dernier : un grille-pain).",
    date: daysFromNow(-6, 9, 30),
    locationName: 'Berges du Rhône, Lyon',
    latitude: 45.7597,
    longitude: 4.8422,
    createdBy: camille,
  });

  const assembly = await insertEvent(db, {
    title: 'Assemblée générale (avec croissants)',
    description:
      "Bilan de l'année, vote du budget et élection du bureau. Des croissants sont promis pour atteindre le quorum.",
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
