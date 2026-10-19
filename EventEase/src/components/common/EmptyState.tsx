import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, typography } from '@/theme/tokens';

type Props = {
  icon: ComponentProps<typeof Feather>['name'];
  title: string;
  message?: string;
  /** Bouton facultatif (« Créer un événement », « Réessayer »…). */
  action?: ReactNode;
};

/** Message affiché à la place d'une liste vide, d'une erreur ou d'un élément introuvable. */
export function EmptyState({ icon, title, message, action }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View
        style={[styles.icon, { backgroundColor: colors.primarySoft }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Feather name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={[typography.heading, styles.center, { color: colors.text }]}>{title}</Text>
      {message ? <Text style={[typography.body, styles.center, { color: colors.muted }]}>{message}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  icon: { width: 64, height: 64, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
});
