/**
 * Détail d'un événement. Les boutons Modifier / Supprimer n'apparaissent que
 * pour son créateur (et la requête SQL le vérifie aussi, voir services/events.ts).
 */

import Feather from '@expo/vector-icons/Feather';
import { router, useLocalSearchParams } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { LoadState } from '@/components/common/LoadState';
import { Button, Card, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useEvent } from '@/hooks/useEvent';
import { useEventActions } from '@/hooks/useEventActions';
import { fr } from '@/i18n/fr';
import { spacing, typography } from '@/theme/tokens';
import { formatEventDate } from '@/utils/date';

const t = fr.eventDetail;

export default function EventDetail() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const { user } = useAuth();
  const { data: event, loading, error, reload } = useEvent(eventId);
  const { remove } = useEventActions();
  const [deleting, setDeleting] = useState(false);

  const isMine = event != null && event.createdBy === user?.id;

  const confirmDelete = () => {
    // Confirmation native : une suppression ne doit jamais partir d'un appui accidentel.
    Alert.alert(t.deleteTitle, t.deleteMessage, [
      { text: fr.common.cancel, style: 'cancel' },
      {
        text: fr.common.delete,
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await remove(eventId);
            router.back();
          } catch {
            setDeleting(false);
            Alert.alert(t.deleteError);
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll edges={['bottom', 'left', 'right']}>
      <LoadState loading={loading} error={error} hasData={event != null} onRetry={reload} errorTitle={fr.events.loadError}>
        {event ? (
          <>
            <View style={styles.header}>
              <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
                {event.title}
              </Text>
              <InfoRow icon="calendar" text={formatEventDate(event.date)} capitalize />
              {event.locationName ? <InfoRow icon="map-pin" text={event.locationName} /> : null}
              <InfoRow icon="user" text={isMine ? fr.events.mine : fr.events.organisedBy(event.creatorName)} />
            </View>

            <Card>
              <Text style={[typography.section, { color: colors.muted }]}>{t.description}</Text>
              <Text style={[typography.body, { color: colors.text }]}>{event.description}</Text>
            </Card>

            {isMine ? (
              <View style={styles.actions}>
                <Button
                  variant="outline"
                  icon="edit-2"
                  label={fr.common.edit}
                  onPress={() => router.push({ pathname: '/event/[id]/edit', params: { id: String(eventId) } })}
                />
                <Button variant="danger" icon="trash-2" label={fr.common.delete} onPress={confirmDelete} loading={deleting} />
              </View>
            ) : null}
          </>
        ) : (
          <EmptyState
            icon="search"
            title={t.notFoundTitle}
            message={t.notFoundMessage}
            action={<Button variant="outline" label={t.back} onPress={() => router.back()} />}
          />
        )}
      </LoadState>
    </Screen>
  );
}

type InfoRowProps = { icon: ComponentProps<typeof Feather>['name']; text: string; capitalize?: boolean };

/** Ligne icône + texte (date, lieu, organisateur). */
function InfoRow({ icon, text, capitalize = false }: InfoRowProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Feather name={icon} size={16} color={colors.primary} />
      <Text style={[typography.body, styles.flex, capitalize && styles.capitalize, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  capitalize: { textTransform: 'capitalize' },
  actions: { gap: spacing.sm },
});
