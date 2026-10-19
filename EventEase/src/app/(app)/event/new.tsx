import { router } from 'expo-router';

import { EventForm } from '@/components/events/EventForm';
import { useEventActions } from '@/hooks/useEventActions';
import { fr } from '@/i18n/fr';
import { defaultEventDate } from '@/utils/date';

/** Création d'un événement (présentée en modale). */
export default function NewEvent() {
  const { create } = useEventActions();

  return (
    <EventForm
      initial={{ title: '', description: '', date: defaultEventDate(), locationName: null }}
      isNew
      submitLabel={fr.eventForm.create}
      onSubmit={async (input) => {
        await create(input);
        // Retour à la liste, qui se recharge toute seule (useFocusEffect).
        router.back();
      }}
      onCancel={() => router.back()}
    />
  );
}
