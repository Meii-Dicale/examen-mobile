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
import { deletePhotoFile, pickPhoto, savePhotoFile, type PhotoSource } from '@/services/photoFiles';
import { addPhoto, deletePhoto, listPhotoPaths } from '@/services/photos';
import type { Event, EventInput } from '@/types/event';
import type { EventPhoto } from '@/types/photo';

export function useEventActions() {
  const db = useSQLiteContext();
  const userId = useCurrentUserId();

  return {
    // Les coordonnées du lieu arrivent déjà dans `input` (trouvées par le formulaire).
    create: (input: EventInput) => createEvent(db, userId, input),
    update: (id: number, input: EventInput) => updateEvent(db, userId, id, input),

    /**
     * Supprime l'événement. La base efface ses photos (ON DELETE CASCADE), mais pas
     * les FICHIERS : on note leurs chemins avant, et on les efface après.
     */
    remove: async (id: number) => {
      const paths = await listPhotoPaths(db, id);
      // Si ce n'est pas le créateur, deleteEvent lève une erreur : aucun fichier n'est touché.
      await deleteEvent(db, userId, id);
      paths.forEach(deletePhotoFile);
    },

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

    /**
     * Choisit une photo, la copie dans le dossier de l'app, puis l'enregistre en base.
     * Renvoie false si l'utilisateur a annulé le choix.
     */
    addPhoto: async (eventId: number, source: PhotoSource): Promise<boolean> => {
      const tempUri = await pickPhoto(source);
      if (!tempUri) return false;
      const path = await savePhotoFile(tempUri);
      try {
        await addPhoto(db, userId, eventId, path);
      } catch (error) {
        // Ajout refusé par la base : on ne laisse pas un fichier orphelin.
        deletePhotoFile(path);
        throw error;
      }
      return true;
    },

    /** Supprime une de ses photos : la ligne en base, puis le fichier. */
    removePhoto: async (photo: EventPhoto) => {
      const path = await deletePhoto(db, userId, photo.id);
      if (path) deletePhotoFile(path);
    },
  };
}
