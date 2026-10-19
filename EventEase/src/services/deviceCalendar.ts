/**
 * Agenda du téléphone (expo-calendar) : à ne pas confondre avec react-native-calendars,
 * qui ne fait qu'AFFICHER un calendrier dans l'app. Ici, on écrit dans l'app
 * Calendrier du système (iOS) ou Google Agenda (Android).
 *
 * Pourquoi `expo-calendar/legacy` ? En SDK 57, expo-calendar propose une nouvelle API
 * orientée objet, mais elle n'est pas incluse dans Expo Go. L'API « legacy » (fonctions
 * `…Async`) est toujours documentée, maintenue et incluse dans Expo Go : on peut donc
 * tester sur le téléphone sans development build.
 */

import * as Calendar from 'expo-calendar/legacy';
import { Platform } from 'react-native';

import type { Event } from '@/types/event';

/** Durée par défaut d'un événement (on ne stocke que l'heure de début). */
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;
/** Rappel 1 h avant (en minutes, négatif = avant le début). */
const REMINDER_OFFSET_MINUTES = -60;

/** L'utilisateur a refusé l'accès à l'agenda. */
export class CalendarPermissionError extends Error {
  constructor() {
    super('calendar-permission-denied');
    this.name = 'CalendarPermissionError';
  }
}

/** Demande la permission (la fenêtre système ne s'affiche qu'une fois). */
async function ensurePermission(): Promise<void> {
  const { granted } = await Calendar.requestCalendarPermissionsAsync();
  if (!granted) throw new CalendarPermissionError();
}

/**
 * Id du calendrier dans lequel écrire :
 * - iOS a un calendrier par défaut, choisi par l'utilisateur dans les réglages ;
 * - Android n'en a pas : on prend le calendrier principal d'un compte, modifiable.
 */
async function getWritableCalendarId(): Promise<string> {
  if (Platform.OS === 'ios') {
    const calendar = await Calendar.getDefaultCalendarAsync();
    return calendar.id;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.filter((calendar) => calendar.allowsModifications);
  const calendar = writable.find((item) => item.isPrimary) ?? writable[0];
  if (!calendar) throw new Error('no-writable-calendar');
  return calendar.id;
}

/** Ajoute l'événement à l'agenda et renvoie l'id créé par le système. */
export async function addToDeviceCalendar(event: Event): Promise<string> {
  await ensurePermission();
  const calendarId = await getWritableCalendarId();
  const startDate = new Date(event.date);

  return Calendar.createEventAsync(calendarId, {
    title: event.title,
    startDate,
    endDate: new Date(startDate.getTime() + DEFAULT_DURATION_MS),
    location: event.locationName ?? undefined,
    notes: event.description,
    // Fuseau du téléphone : obligatoire sur Android.
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    alarms: [{ relativeOffset: REMINDER_OFFSET_MINUTES }],
  });
}

/**
 * Retire l'événement de l'agenda. S'il a déjà été supprimé à la main dans
 * l'agenda, l'appel échoue : ce n'est pas grave, le résultat voulu est atteint.
 */
export async function removeFromDeviceCalendar(deviceCalendarEventId: string): Promise<void> {
  try {
    await Calendar.deleteEventAsync(deviceCalendarEventId);
  } catch {
    // Déjà supprimé, ou permission retirée entre-temps : on ignore.
  }
}
