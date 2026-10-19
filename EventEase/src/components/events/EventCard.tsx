import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import type { Event } from '@/types/event';
import { radius, spacing, typography } from '@/theme/tokens';
import { formatEventDate, isPast } from '@/utils/date';

type Props = {
  event: Event;
  /** true si l'utilisateur connecté a créé l'événement. */
  isMine: boolean;
  onPress: () => void;
};

/** Carte d'un événement dans la liste : date, titre, description, lieu, participants. */
export function EventCard({ event, isMine, onPress }: Props) {
  const { colors } = useTheme();
  const date = formatEventDate(event.date);
  const participants = fr.participation.count(event.participantCount, isPast(event.date));

  return (
    <Card
      onPress={onPress}
      // Une seule phrase pour le lecteur d'écran, au lieu de 4 éléments séparés.
      accessibilityLabel={[
        event.title,
        date,
        event.locationName,
        isMine ? fr.events.mine : null,
        event.isParticipating ? fr.participation.badge : null,
        participants,
      ]
        .filter(Boolean)
        .join(', ')}
    >
      <View style={styles.top}>
        <Text style={[typography.caption, styles.date, { color: colors.primary }]}>{date}</Text>
        {isMine ? (
          <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
            <Text style={[typography.caption, { color: colors.accentInk }]}>{fr.events.mine}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[typography.heading, { color: colors.text }]}>{event.title}</Text>
      {/* 2 lignes maximum : le texte complet est sur le détail. */}
      <Text numberOfLines={2} style={[typography.body, { color: colors.muted }]}>
        {event.description}
      </Text>
      {event.locationName ? (
        <View style={styles.location}>
          <Feather name="map-pin" size={14} color={colors.muted} />
          <Text numberOfLines={1} style={[typography.caption, styles.flex, { color: colors.muted }]}>
            {event.locationName}
          </Text>
        </View>
      ) : null}
      <View style={styles.footer}>
        <View style={styles.location}>
          <Feather name="users" size={14} color={colors.muted} />
          <Text style={[typography.caption, { color: colors.muted }]}>{participants}</Text>
        </View>
        {event.isParticipating ? (
          <View style={[styles.badge, styles.joined, { backgroundColor: colors.primarySoft }]}>
            <Feather name="check" size={12} color={colors.primary} />
            <Text style={[typography.caption, { color: colors.primary }]}>{fr.participation.badge}</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  date: { flex: 1, textTransform: 'capitalize' },
  badge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  location: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  flex: { flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  joined: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
