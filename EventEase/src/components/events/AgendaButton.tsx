import { Button } from '@/components/ui';
import { fr } from '@/i18n/fr';

type Props = {
  /** true si l'événement est déjà dans l'agenda du téléphone. */
  added: boolean;
  onPress: () => void;
  loading: boolean;
};

const t = fr.agenda;

/**
 * « Ajouter à mon agenda ». Deux cas :
 * - pas encore ajouté : bouton secondaire ;
 * - déjà ajouté : bouton désactivé (pas de doublon possible dans l'agenda).
 */
export function AgendaButton({ added, onPress, loading }: Props) {
  if (added) {
    return <Button variant="soft" icon="check" label={t.added} accessibilityHint={t.addedHint} disabled />;
  }
  return <Button variant="outline" icon="calendar" label={t.add} onPress={onPress} loading={loading} />;
}
