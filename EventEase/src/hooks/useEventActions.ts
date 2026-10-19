/**
 * Actions d'écriture sur les événements et les participations. Le hook fournit
 * lui-même la base et l'utilisateur connecté : l'écran n'a jamais à passer `userId`,
 * il ne peut donc pas agir « au nom » de quelqu'un d'autre.
 */

import { useSQLiteContext } from 'expo-sqlite';

import { useCurrentUserId } from '@/context/AuthContext';
import { addToDeviceCalendar, removeFromDeviceCalendar } from '@/services/deviceCalendar';
import { createEvent, deleteEvent, updateEvent } from '@/services/events';
import { geocodePlace } from '@/services/location';
import { addParticipation, removeParticipation, setDeviceCalendarEventId } from '@/services/participations';
import type { Event, EventInput } from '@/types/event';
import type { Coordinates } from '@/types/location';

/** Pas de lieu saisi : pas de coordonnées (et pas d'appel réseau inutile). */
function geocode(locationName: string | null): Promise<Coordinates | null> {
  return locationName ? geocodePlace(locationName) : Promise.resolve(null);
}

export function useEventActions() {
  const db = useSQLiteContext();
  const userId = useCurrentUserId();

  return {
    /**
     * Le lieu est géocodé AVANT l'enregistrement. S'il est introuvable (ou pas de
     * réseau), l'événement est quand même créé, simplement sans distance.
     */
    create: async (input: EventInput) => createEvent(db, userId, input, await geocode(input.locationName)),

    /** Lieu inchangé : on garde les coordonnées déjà calculées, sans nouvelle requête. */
    update: async (event: Event, input: EventInput) => {
      const sameLocation = input.locationName === event.locationName;
      const coords =
        sameLocation && event.latitude != null && event.longitude != null
          ? { latitude: event.latitude, longitude: event.longitude }
          : await geocode(input.locationName);
      await updateEvent(db, userId, event.id, input, coords);
    },
    remove: (id: number) => deleteEvent(db, userId, id),

    /** Ajoute ou retire la participation selon l'état actuel. */
    toggleParticipation: async (event: Event) => {
      if (!event.isParticipating) {
        await addParticipation(db, userId, event.id);
        return;
      }
      // Annuler sa participation retire aussi l'événement de l'agenda du téléphone.
      if (event.deviceCalendarEventId) await removeFromDeviceCalendar(event.deviceCalendarEventId);
      await removeParticipation(db, userId, event.id);
    },

    /**
     * Ajoute l'événement à l'agenda du téléphone et mémorise l'id obtenu.
     * Déjà ajouté : on ne fait rien (pas de doublon dans l'agenda).
     */
    addToAgenda: async (event: Event) => {
      if (event.deviceCalendarEventId) return;
      const deviceCalendarEventId = await addToDeviceCalendar(event);
      await setDeviceCalendarEventId(db, userId, event.id, deviceCalendarEventId);
    },
  };
}
