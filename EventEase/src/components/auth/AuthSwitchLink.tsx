import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { touchTarget, typography } from '@/theme/tokens';

type Props = {
  question: string;
  action: string;
  href: Href;
  /** true : revient à un écran déjà dans la pile au lieu d'en empiler un nouveau. */
  dismissTo?: boolean;
};

/** Lien « Pas encore de compte ? Créer un compte » sous les formulaires. */
export function AuthSwitchLink({ question, action, href, dismissTo = false }: Props) {
  const { colors } = useTheme();

  return (
    // asChild : Link donne sa navigation au Pressable, qui garde son style et sa zone tactile.
    <Link href={href} dismissTo={dismissTo} asChild>
      <Pressable accessibilityRole="link" style={styles.link}>
        <Text style={[typography.body, { color: colors.muted }]}>
          {question} <Text style={[typography.label, { color: colors.primary }]}>{action}</Text>
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  link: { minHeight: touchTarget, alignItems: 'center', justifyContent: 'center' },
});
