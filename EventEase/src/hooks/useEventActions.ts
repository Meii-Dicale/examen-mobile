/**
 * Actions d'écriture sur les événements et les participations. Le hook fournit
 * lui-même la base et l'utilisateur connecté : l'écran n'a jamais à passer `userId`,
 * il ne peut donc pas agir « au nom » de quelqu'un d'autre.
 */

import { useSQLiteContext } from 'expo-sqlite';

import { useCurrentUserId } from '@/context/AuthContext';
import { addToDeviceCalendar, removeFromDeviceCalendar } from '@/services/deviceCalendar';
import { createEvent, deleteEvent, updateEvent } from '@/services/events';
import { addParticipation, removeParticipation, setDeviceCalendarEventId } from '@/services/participations';
import type { Event, EventInput } from '@/types/event';

export function useEventActions() {
  const db = useSQLiteContext();
  const userId = useCurrentUserId();

  return {
    // Les coordonnées du lieu arrivent déjà dans `input` (trouvées par le formulaire).
    create: (input: EventInput) => createEvent(db, userId, input),
    update: (id: number, input: EventInput) => updateEvent(db, userId, id, input),
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
