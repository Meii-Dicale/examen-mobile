import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import { radius, spacing, typography } from '@/theme/tokens';

type Props = { title: string; subtitle: string };

/**
 * En-tête commun à la connexion et à l'inscription.
 * Le pictogramme est provisoire : le logo B (ticket validé) arrive dans feat/design-finitions.
 */
export function AuthHeader({ title, subtitle }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <View
        style={[styles.logo, { backgroundColor: colors.primary }]}
        // Décoratif : le lecteur d'écran lit le nom de l'app juste en dessous.
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Feather name="check-circle" size={32} color={colors.onPrimary} />
      </View>
      <Text style={[typography.section, { color: colors.accentInk }]}>{fr.app.name}</Text>
      <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[typography.body, { color: colors.muted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginTop: spacing.xxl, marginBottom: spacing.md },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
});
