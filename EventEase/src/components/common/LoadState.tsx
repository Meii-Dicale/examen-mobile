import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import { spacing } from '@/theme/tokens';

import { EmptyState } from './EmptyState';

type Props = {
  loading: boolean;
  error: Error | null;
  /** true dès qu'une première réponse est arrivée (même vide). */
  hasData: boolean;
  onRetry: () => void;
  errorTitle: string;
  children: ReactNode;
};

/**
 * Gère les trois états d'un chargement : en cours, en erreur, prêt.
 * La roue n'apparaît qu'au PREMIER chargement : quand on revient sur un écran,
 * les anciennes données restent affichées pendant le rafraîchissement.
 */
export function LoadState({ loading, error, hasData, onRetry, errorTitle, children }: Props) {
  const { colors } = useTheme();

  if (error) {
    return (
      <EmptyState
        icon="alert-triangle"
        title={errorTitle}
        action={<Button variant="outline" icon="refresh-cw" label={fr.events.retry} onPress={onRetry} />}
      />
    );
  }
  if (loading && !hasData) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel={fr.common.loading} />
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: { paddingVertical: spacing.xxl, alignItems: 'center' },
});
