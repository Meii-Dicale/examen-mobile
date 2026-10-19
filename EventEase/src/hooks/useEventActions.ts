/**
 * Actions d'écriture sur les événements. Le hook fournit lui-même la base et
 * l'utilisateur connecté : l'écran n'a jamais à passer `userId`, il ne peut donc
 * pas créer ou supprimer un événement « au nom » de quelqu'un d'autre.
 */

import { useSQLiteContext } from 'expo-sqlite';

import { useAuth } from '@/context/AuthContext';
import { createEvent, deleteEvent, updateEvent } from '@/services/events';
import type { EventInput } from '@/types/event';

export function useEventActions() {
  const db = useSQLiteContext();
  const { user } = useAuth();

  // Ces écrans sont protégés par Stack.Protected : `user` existe toujours ici.
  const requireUserId = (): number => {
    if (!user) throw new Error('Aucun utilisateur connecté');
    return user.id;
  };

  return {
    create: (input: EventInput) => createEvent(db, requireUserId(), input),
    update: (id: number, input: EventInput) => updateEvent(db, requireUserId(), id, input),
    remove: (id: number) => deleteEvent(db, requireUserId(), id),
  };
}
