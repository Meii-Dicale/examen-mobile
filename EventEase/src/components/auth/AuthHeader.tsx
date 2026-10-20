import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import { spacing, typography } from '@/theme/tokens';

/** Largeur du logo, en points : bien visible en haut de l'écran d'accueil. */
const LOGO_SIZE = 72;

type Props = { title: string; subtitle: string };

/**
 * En-tête commun à la connexion et à l'inscription.
 * Le logo B (ticket validé) suit les couleurs du thème, comme dans la maquette.
 */
export function AuthHeader({ title, subtitle }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <Logo size={LOGO_SIZE} />
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
});
