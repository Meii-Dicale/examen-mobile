/**
 * Agenda du téléphone (expo-calendar) : à ne pas confondre avec react-native-calendars,
 * qui ne fait qu'AFFICHER un calendrier dans l'app. Ici, on écrit dans l'app
 * Calendrier du système (iOS) ou Google Agenda (Android).
 *
 * Limite : expo-calendar contient du code natif absent d'Expo Go (SDK 57). Dans Expo Go,
 * le module est remplacé par une version vide qui lève une erreur : on teste donc
 * `isDeviceCalendarAvailable` avant d'afficher le bouton. Il faut un « development build »
 * (`npx expo run:ios|android` ou `eas build --profile development`) pour l'utiliser.
 */

import { isRunningInExpoGo } from 'expo';
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

import type { Event } from '@/types/event';

/** Durée par défaut d'un événement (on ne stocke que l'heure de début). */
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;
/** Rappel 1 h avant (en minutes, négatif = avant le début). */
const REMINDER_OFFSET_MINUTES = -60;

export const isDeviceCalendarAvailable = !isRunningInExpoGo() && Platform.OS !== 'web';

/** L'utilisateur a refusé l'accès à l'agenda. */
export class CalendarPermissionError extends Error {
  constructor() {
    super('calendar-permission-denied');
    this.name = 'CalendarPermissionError';
  }
}

/** Demande la permission (la fenêtre système ne s'affiche qu'une fois). */
async function ensurePermission(): Promise<void> {
  const { granted } = await Calendar.requestCalendarPermissions();
  if (!granted) throw new CalendarPermissionError();
}

/**
 * Calendrier dans lequel écrire :
 * - iOS a un calendrier par défaut, choisi par l'utilisateur dans les réglages ;
 * - Android n'en a pas : on prend le calendrier principal d'un compte, modifiable.
 */
async function getWritableCalendar(): Promise<Calendar.ExpoCalendar> {
  if (Platform.OS === 'ios') return Calendar.getDefaultCalendarSync();

  const calendars = await Calendar.getCalendars();
  const writable = calendars.filter((calendar) => calendar.allowsModifications);
  const calendar = writable.find((item) => item.isPrimary) ?? writable[0];
  if (!calendar) throw new Error('no-writable-calendar');
  return calendar;
}

/** Ajoute l'événement à l'agenda et renvoie l'id créé par le système. */
export async function addToDeviceCalendar(event: Event): Promise<string> {
  await ensurePermission();
  const calendar = await getWritableCalendar();
  const startDate = new Date(event.date);

  const created = await calendar.createEvent({
    title: event.title,
    startDate,
    endDate: new Date(startDate.getTime() + DEFAULT_DURATION_MS),
    location: event.locationName ?? undefined,
    notes: event.description,
    // Fuseau du téléphone : obligatoire sur Android.
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    alarms: [{ relativeOffset: REMINDER_OFFSET_MINUTES }],
  });
  return created.id;
}

/**
 * Retire l'événement de l'agenda. Si l'utilisateur l'a déjà supprimé lui-même
 * dans son agenda, `get` échoue : ce n'est pas grave, le résultat voulu est atteint.
 */
export async function removeFromDeviceCalendar(deviceCalendarEventId: string): Promise<void> {
  try {
    const event = await Calendar.ExpoCalendarEvent.get(deviceCalendarEventId);
    await event.delete();
  } catch {
    // Déjà supprimé, ou permission retirée entre-temps : on ignore.
  }
}
