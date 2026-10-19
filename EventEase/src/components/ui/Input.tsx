import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, typography } from '@/theme/tokens';

/**
 * Champ de saisie avec son libellé et son message d'erreur.
 * On reprend toutes les props de TextInput (value, onChangeText, secureTextEntry…)
 * et on ajoute `label` et `error`.
 */
type Props = TextInputProps & {
  label: string;
  error?: string | null;
};

export function Input({ label, error, multiline, style, onFocus, onBlur, ...rest }: Props) {
  const { colors } = useTheme();
  // Le champ actif a une bordure prune, comme dans la maquette.
  const [focused, setFocused] = useState(false);

  // Priorité des bordures : erreur > champ actif > normal.
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        // Le lecteur d'écran relit l'erreur quand on revient sur le champ.
        accessibilityHint={error ?? undefined}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        // On garde les onFocus / onBlur éventuellement passés par l'écran.
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          multiline && styles.multiline,
          { backgroundColor: colors.surface, borderColor, color: colors.text },
          style,
        ]}
        {...rest}
      />
      {error ? (
        // « polite » : Android annonce l'erreur dès qu'elle apparaît.
        <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: typography.label,
  input: {
    ...typography.body,
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  multiline: {
    minHeight: 96,
    paddingVertical: spacing.md,
    // Sur Android, le texte d'un champ multiligne est centré verticalement par défaut.
    textAlignVertical: 'top',
  },
  error: typography.caption,
});
