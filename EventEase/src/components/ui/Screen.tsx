import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { spacing } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  /** true pour un écran qui défile (formulaire, détail). */
  scroll?: boolean;
  /**
   * Bords protégés de l'encoche et de la barre d'accueil. Tous par défaut ;
   * sous une barre d'onglets, on retire 'bottom' (les onglets la gèrent déjà).
   */
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
};

/** Conteneur de base de chaque écran : fond du thème, marges, zone sûre. */
export function Screen({ children, scroll = false, edges = ['top', 'bottom', 'left', 'right'], contentStyle }: Props) {
  const { colors } = useTheme();
  const content = [styles.content, contentStyle];

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.bg }]}>
      {scroll ? (
        // « handled » : un appui sur un bouton fonctionne même si le clavier est ouvert.
        <ScrollView contentContainerStyle={content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, content]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
});
