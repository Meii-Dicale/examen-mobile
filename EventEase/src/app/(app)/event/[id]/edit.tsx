import { router, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/common/EmptyState';
import { LoadState } from '@/components/common/LoadState';
import { EventForm } from '@/components/events/EventForm';
import { Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/hooks/useEvent';
import { useEventActions } from '@/hooks/useEventActions';
import { fr } from '@/i18n/fr';

/** Modification d'un événement : le même formulaire, pré-rempli. */
export default function EditEvent() {
  // Les paramètres d'URL sont toujours des chaînes : on convertit en nombre.
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const { user } = useAuth();
  const { data: event, loading, error, reload } = useEvent(eventId);
  const { update } = useEventActions();

  return (
    <LoadState loading={loading} error={error} hasData={event != null} onRetry={reload} errorTitle={fr.events.loadError}>
      {/* Introuvable, ou pas le créateur (lien direct) : on ne montre pas le formulaire. */}
      {event && event.createdBy === user?.id ? (
        <EventForm
          // `key` : si l'événement est rechargé, le formulaire repart de ses valeurs.
          key={event.updatedAt}
          initial={event}
          isNew={false}
          submitLabel={fr.common.save}
          onSubmit={async (input) => {
            await update(event, input);
            router.back();
          }}
          onCancel={() => router.back()}
        />
      ) : (
        <Screen edges={['bottom', 'left', 'right']}>
          <EmptyState icon="search" title={fr.eventDetail.notFoundTitle} message={fr.eventDetail.notFoundMessage} />
        </Screen>
      )}
    </LoadState>
  );
}
