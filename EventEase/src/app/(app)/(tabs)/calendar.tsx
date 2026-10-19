/**
 * Onglet Calendrier (react-native-calendars) : un point sous chaque jour qui a
 * des événements ; toucher un jour affiche ses événements en dessous.
 * Les données viennent du même hook que la liste (useEvents) : rien de nouveau en base.
 */

import { router } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { LoadState } from '@/components/common/LoadState';
import { EventCard } from '@/components/events/EventCard';
import { Card, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useEvents } from '@/hooks/useEvents';
import '@/i18n/calendarLocale';
import { fr } from '@/i18n/fr';
import type { Event } from '@/types/event';
import { fonts, spacing, typography } from '@/theme/tokens';
import { dayKeyToIso, formatDay, toDayKey } from '@/utils/date';

const t = fr.calendar;

// Type de la prop `markedDates`, repris du composant (la librairie ne l'exporte pas).
type MarkedDates = NonNullable<ComponentProps<typeof Calendar>['markedDates']>;

export default function CalendarTab() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { data, loading, error, reload } = useEvents();
  // Jour sélectionné, au format « AAAA-MM-JJ » ; aujourd'hui par défaut.
  const [selectedDay, setSelectedDay] = useState(() => toDayKey(new Date().toISOString()));

  const events = data ?? [];
  const dayEvents = events.filter((event) => toDayKey(event.date) === selectedDay);

  return (
    <Screen scroll edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
          {t.title}
        </Text>
        <Text style={[typography.body, { color: colors.muted }]}>{t.subtitle}</Text>
      </View>

      <Card style={styles.calendarCard}>
        <Calendar
          // La librairie ne relit pas `theme` après le premier affichage : changer la
          // `key` au changement clair / sombre recrée le composant avec les bonnes couleurs.
          key={isDark ? 'dark' : 'light'}
          current={selectedDay}
          onDayPress={(day: DateData) => setSelectedDay(day.dateString)}
          markedDates={buildMarkedDates(events, selectedDay, colors)}
          firstDay={1}
          enableSwipeMonths
          theme={{
            calendarBackground: colors.surface,
            monthTextColor: colors.text,
            textSectionTitleColor: colors.muted,
            dayTextColor: colors.text,
            textDisabledColor: colors.border,
            todayTextColor: colors.primary,
            arrowColor: colors.primary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.onPrimary,
            // accentInk et pas accent : un point pêche clair serait peu visible (contraste).
            dotColor: colors.accentInk,
            selectedDotColor: colors.onPrimary,
            textDayFontFamily: fonts.medium,
            textMonthFontFamily: fonts.bold,
            textDayHeaderFontFamily: fonts.semiBold,
          }}
        />
      </Card>

      <Text accessibilityRole="header" style={[typography.section, { color: colors.muted }]}>
        {t.dayEvents(formatDay(dayKeyToIso(selectedDay)))}
      </Text>
      <LoadState loading={loading} error={error} hasData={data != null} onRetry={reload} errorTitle={fr.events.loadError}>
        {dayEvents.length === 0 ? (
          <Text style={[typography.body, { color: colors.muted }]}>{t.emptyDay}</Text>
        ) : (
          dayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isMine={event.createdBy === user?.id}
              onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(event.id) } })}
            />
          ))
        )}
      </LoadState>
    </Screen>
  );
}

/**
 * Objet attendu par react-native-calendars : une clé par jour à décorer.
 * { '2026-10-20': { marked: true }, '2026-10-21': { selected: true, marked: true } }
 */
function buildMarkedDates(
  events: Event[],
  selectedDay: string,
  colors: ReturnType<typeof useTheme>['colors'],
): MarkedDates {
  const marked: MarkedDates = {};
  for (const event of events) {
    marked[toDayKey(event.date)] = { marked: true, dotColor: colors.accentInk };
  }
  // Le jour sélectionné garde son point s'il en a un (spread de l'entrée existante).
  marked[selectedDay] = {
    ...marked[selectedDay],
    selected: true,
    selectedColor: colors.primary,
    selectedTextColor: colors.onPrimary,
  };
  return marked;
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  // Le calendrier a ses propres marges : on retire celles de la carte.
  calendarCard: { padding: spacing.xs, overflow: 'hidden' },
});
