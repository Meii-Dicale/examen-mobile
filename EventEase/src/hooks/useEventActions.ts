/**
 * Actions d'écriture sur les événements et les participations. Le hook fournit
 * lui-même la base et l'utilisateur connecté : l'écran n'a jamais à passer `userId`,
 * il ne peut donc pas agir « au nom » de quelqu'un d'autre.
 */

import { useSQLiteContext } from 'expo-sqlite';

import { useCurrentUserId } from '@/context/AuthContext';
import { createEvent, deleteEvent, updateEvent } from '@/services/events';
import { addParticipation, removeParticipation } from '@/services/participations';
import type { EventInput } from '@/types/event';

export function useEventActions() {
  const db = useSQLiteContext();
  const userId = useCurrentUserId();

  return {
    create: (input: EventInput) => createEvent(db, userId, input),
    update: (id: number, input: EventInput) => updateEvent(db, userId, id, input),
    remove: (id: number) => deleteEvent(db, userId, id),
    /** Ajoute ou retire la participation selon l'état actuel. */
    toggleParticipation: (eventId: number, isParticipating: boolean) =>
      isParticipating ? removeParticipation(db, userId, eventId) : addParticipation(db, userId, eventId),
  };
}
