/**
 * Onglet Événements : la liste, séparée en « À venir » et « Passés ».
 * Un bouton + flottant ouvre la création.
 */

import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/common/EmptyState';
import { LoadState } from '@/components/common/LoadState';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useEvents } from '@/hooks/useEvents';
import { fr } from '@/i18n/fr';
import type { Event } from '@/types/event';
import { radius, spacing, typography } from '@/theme/tokens';
import { isPast } from '@/utils/date';

const t = fr.events;

/** Sépare les événements en deux sections ; les passés, du plus récent au plus ancien. */
function toSections(events: Event[]) {
  const upcoming = events.filter((event) => !isPast(event.date));
  const past = events.filter((event) => isPast(event.date)).reverse();
  return [
    { title: t.upcoming, data: upcoming },
    { title: t.past, data: past },
  ].filter((section) => section.data.length > 0);
}

export default function EventsTab() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data, loading, error, reload } = useEvents();
  // Hauteur de l'encoche / barre d'état : la liste défile dessous, mais commence après.
  const insets = useSafeAreaInsets();

  const openCreate = () => router.push('/event/new');
  const openEvent = (id: number) => router.push({ pathname: '/event/[id]', params: { id: String(id) } });

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LoadState loading={loading} error={error} hasData={data != null} onRetry={reload} errorTitle={t.loadError}>
        {/*
          SectionList plutôt qu'un .map() dans un ScrollView : seules les cartes
          visibles sont rendues, ce qui reste fluide même avec beaucoup d'événements.
        */}
        <SectionList
          sections={toSections(data ?? [])}
          keyExtractor={(event) => String(event.id)}
          contentContainerStyle={[styles.list, { paddingTop: insets.top + spacing.lg }]}
          // Tirer la liste vers le bas pour la rafraîchir.
          refreshing={loading && data != null}
          onRefresh={reload}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
                {t.title}
              </Text>
              <Text style={[typography.body, { color: colors.muted }]}>{t.subtitle}</Text>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <Text accessibilityRole="header" style={[typography.section, styles.section, { color: colors.muted }]}>
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <EventCard event={item} isMine={item.createdBy === user?.id} onPress={() => openEvent(item.id)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              icon="calendar"
              title={t.emptyTitle}
              message={t.emptyMessage}
              action={<Button label={t.create} icon="plus" onPress={openCreate} />}
            />
          }
        />
      </LoadState>

      {/* Bouton flottant : fond pêche (accent), icône foncée (onAccent) pour le contraste. */}
      <Pressable
        onPress={openCreate}
        accessibilityRole="button"
        accessibilityLabel={t.create}
        style={({ pressed }) => [styles.fab, { backgroundColor: colors.accent }, pressed && styles.pressed]}
      >
        <Feather name="plus" size={28} color={colors.onAccent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // 96 en bas : le dernier élément ne passe pas sous le bouton +.
  list: { paddingHorizontal: spacing.lg, paddingBottom: 96 },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  section: { marginTop: spacing.lg, marginBottom: spacing.sm },
  separator: { height: spacing.md },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    // Ombre légère pour détacher le bouton de la liste.
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pressed: { opacity: 0.8 },
});
