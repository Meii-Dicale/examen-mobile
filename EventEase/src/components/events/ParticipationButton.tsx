import { Button } from '@/components/ui';
import { fr } from '@/i18n/fr';

type Props = {
  isParticipating: boolean;
  /** Événement passé : le libellé passe au passé (« J'y ai participé »). */
  isPast: boolean;
  onPress: () => void;
  loading: boolean;
};

const t = fr.participation;

/**
 * Bouton bascule de participation. Deux apparences :
 * - pas encore inscrit·e : bouton plein (action principale) ;
 * - inscrit·e : bouton « soft » avec une coche, un nouvel appui annule.
 */
export function ParticipationButton({ isParticipating, isPast, onPress, loading }: Props) {
  if (isParticipating) {
    return (
      <Button
        variant="soft"
        icon="check-circle"
        label={isPast ? t.attended : t.joined}
        accessibilityHint={t.cancelHint}
        onPress={onPress}
        loading={loading}
      />
    );
  }
  return (
    <Button
      variant={isPast ? 'outline' : 'primary'}
      icon="plus-circle"
      label={isPast ? t.markAttended : t.join}
      accessibilityHint={t.joinHint}
      onPress={onPress}
      loading={loading}
    />
  );
}
