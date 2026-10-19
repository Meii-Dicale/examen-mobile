import { Text } from 'react-native';

import { Screen } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import { typography } from '@/theme/tokens';

/** Onglet Événements : provisoire, la liste arrive dans feat/events-crud. */
export default function EventsTab() {
  const { colors } = useTheme();

  return (
    // Pas de bord 'bottom' : la barre d'onglets gère déjà le bas de l'écran.
    <Screen edges={['top', 'left', 'right']}>
      <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
        {fr.events.title}
      </Text>
      <Text style={[typography.body, { color: colors.muted }]}>{fr.events.comingSoon}</Text>
    </Screen>
  );
}
