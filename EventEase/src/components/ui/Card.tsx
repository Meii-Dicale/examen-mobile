import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, spacing } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  /** Si onPress est fourni, la carte devient cliquable (ex. : ouvrir le détail d'un événement). */
  onPress?: () => void;
  /** Obligatoire si la carte est cliquable : ce que le lecteur d'écran annonce. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, onPress, accessibilityLabel, style }: Props) {
  const { colors } = useTheme();
  const base = [styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style];

  // Carte simple : un conteneur.
  if (!onPress) return <View style={base}>{children}</View>;

  // Carte cliquable : un Pressable, annoncé comme un bouton.
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pressed: { opacity: 0.8 },
});
