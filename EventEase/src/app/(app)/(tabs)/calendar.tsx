import { Text } from 'react-native';

import { Screen } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import { typography } from '@/theme/tokens';

/** Onglet Calendrier : provisoire, il arrive dans feat/calendar. */
export default function CalendarTab() {
  const { colors } = useTheme();

  return (
    <Screen edges={['top', 'left', 'right']}>
      <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
        {fr.calendar.title}
      </Text>
      <Text style={[typography.body, { color: colors.muted }]}>{fr.calendar.comingSoon}</Text>
    </Screen>
  );
}
