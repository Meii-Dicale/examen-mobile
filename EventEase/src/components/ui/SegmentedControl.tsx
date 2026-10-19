import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, touchTarget, typography } from '@/theme/tokens';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Onglets internes à un écran (ex. : « À venir » / « Passés »).
 * Composant générique : `T` est le type des valeurs possibles, TypeScript
 * vérifie donc que `value` et `onChange` utilisent bien les mêmes.
 */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const { colors } = useTheme();

  return (
    // tablist / tab : VoiceOver annonce « onglet, 1 sur 2, sélectionné ».
    <View accessibilityRole="tablist" style={[styles.track, { backgroundColor: colors.primarySoft }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && { backgroundColor: colors.surface }]}
          >
            <Text style={[typography.label, { color: selected ? colors.primary : colors.muted }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: radius.md, padding: spacing.xs, gap: spacing.xs },
  segment: {
    flex: 1,
    // 48 au total avec le padding du rail : la zone tactile reste accessible.
    minHeight: touchTarget - spacing.xs * 2,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
