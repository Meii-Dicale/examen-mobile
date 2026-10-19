import { Text } from 'react-native';

import { Button } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import { isDeviceCalendarAvailable } from '@/services/deviceCalendar';
import { typography } from '@/theme/tokens';

type Props = {
  /** true si l'événement est déjà dans l'agenda du téléphone. */
  added: boolean;
  onPress: () => void;
  loading: boolean;
};

const t = fr.agenda;

/**
 * « Ajouter à mon agenda ». Trois cas :
 * - Expo Go : expo-calendar n'y existe pas, on explique pourquoi à la place du bouton ;
 * - pas encore ajouté : bouton secondaire ;
 * - déjà ajouté : bouton désactivé (pas de doublon possible dans l'agenda).
 */
export function AgendaButton({ added, onPress, loading }: Props) {
  const { colors } = useTheme();

  if (!isDeviceCalendarAvailable) {
    return <Text style={[typography.caption, { color: colors.muted }]}>{t.unavailable}</Text>;
  }
  if (added) {
    return <Button variant="soft" icon="check" label={t.added} accessibilityHint={t.addedHint} disabled />;
  }
  return <Button variant="outline" icon="calendar" label={t.add} onPress={onPress} loading={loading} />;
}
