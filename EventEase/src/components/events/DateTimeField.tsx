/**
 * Choix de la date et de l'heure d'un événement.
 *
 * Les deux systèmes ne proposent pas le même composant natif :
 * - iOS : un sélecteur « compact » qui gère date ET heure dans une seule ligne ;
 * - Android : il n'existe que des boîtes de dialogue séparées (date, puis heure),
 *   qu'on ouvre nous-mêmes avec DateTimePickerAndroid.open.
 * Dans les deux cas, la valeur échangée avec le formulaire est une chaîne ISO.
 */

import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import { radius, spacing, touchTarget, typography } from '@/theme/tokens';
import { formatDay, formatTime } from '@/utils/date';

type Props = {
  value: string;
  onChange: (iso: string) => void;
  error?: string | null;
};

export function DateTimeField({ value, onChange, error }: Props) {
  const { colors, isDark } = useTheme();
  const current = new Date(value);

  // Android : on garde l'heure quand on change le jour, et inversement.
  const openAndroid = (mode: 'date' | 'time') => {
    DateTimePickerAndroid.open({
      value: current,
      mode,
      is24Hour: true,
      onValueChange: (_event, picked) => {
        const next = new Date(current);
        if (mode === 'date') next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
        else next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
        onChange(next.toISOString());
      },
    });
  };

  return (
    <View style={styles.field}>
      <Text style={[typography.label, { color: colors.muted }]}>
        {fr.eventForm.date} · {fr.eventForm.time}
      </Text>

      {Platform.OS === 'ios' ? (
        <View style={[styles.iosRow, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }]}>
          <DateTimePicker
            value={current}
            mode="datetime"
            display="compact"
            locale="fr-FR"
            minuteInterval={5}
            accentColor={colors.primary}
            // Sans ça, le sélecteur resterait clair en mode sombre.
            themeVariant={isDark ? 'dark' : 'light'}
            onValueChange={(_event, picked) => onChange(picked.toISOString())}
          />
        </View>
      ) : (
        <View style={styles.androidRow}>
          <PickerButton
            icon="calendar"
            label={formatDay(value)}
            hint={fr.eventForm.date}
            onPress={() => openAndroid('date')}
            hasError={!!error}
          />
          <PickerButton
            icon="clock"
            label={formatTime(value)}
            hint={fr.eventForm.time}
            onPress={() => openAndroid('time')}
            hasError={!!error}
          />
        </View>
      )}

      {error ? (
        <Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

type PickerButtonProps = {
  icon: ComponentProps<typeof Feather>['name'];
  label: string;
  hint: string;
  onPress: () => void;
  hasError: boolean;
};

/** Faux champ (Android) : ressemble à un Input, ouvre la boîte de dialogue native. */
function PickerButton({ icon, label, hint, onPress, hasError }: PickerButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${hint} : ${label}`}
      style={({ pressed }) => [
        styles.pickerButton,
        { backgroundColor: colors.surface, borderColor: hasError ? colors.danger : colors.border },
        pressed && styles.pressed,
      ]}
    >
      <Feather name={icon} size={16} color={colors.primary} />
      <Text numberOfLines={1} style={[typography.body, styles.flex, { color: colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  iosRow: {
    minHeight: touchTarget,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  androidRow: { flexDirection: 'row', gap: spacing.sm },
  pickerButton: {
    flex: 1,
    minHeight: touchTarget,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: { opacity: 0.75 },
  flex: { flex: 1, textTransform: 'capitalize' },
});
