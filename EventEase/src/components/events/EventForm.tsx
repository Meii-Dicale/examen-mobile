/**
 * Formulaire partagé entre la création et la modification d'un événement.
 * L'écran fournit les valeurs de départ et ce qu'il faut faire à l'envoi
 * (`onSubmit`) : le formulaire, lui, gère la saisie, la validation et les erreurs.
 */

import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';

import { LiveText } from '@/components/common/LiveText';
import { Button, Input, Screen } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { usePlaceLookup, type PlaceStatus } from '@/hooks/usePlaceLookup';
import { fr } from '@/i18n/fr';
import type { EventInput } from '@/types/event';

import { DateTimeField } from './DateTimeField';
import { spacing, typography } from '@/theme/tokens';
import { hasErrors, TITLE_MAX_LENGTH, validateEvent, type FieldErrors } from '@/utils/validation';

const t = fr.eventForm;

type Props = {
  initial: EventInput;
  /** true à la création : la date ne peut pas être passée. */
  isNew: boolean;
  submitLabel: string;
  onSubmit: (input: EventInput) => Promise<void>;
  onCancel: () => void;
};

export function EventForm({ initial, isNew, submitLabel, onSubmit, onCancel }: Props) {
  const { colors } = useTheme();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [date, setDate] = useState(initial.date);
  const [locationName, setLocationName] = useState(initial.locationName ?? '');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<'title' | 'description' | 'date'>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const initialCoords =
    initial.latitude != null && initial.longitude != null
      ? { latitude: initial.latitude, longitude: initial.longitude }
      : null;
  const place = usePlaceLookup(initial.locationName, initialCoords);

  const submit = async () => {
    const errors = validateEvent({ title, description, date }, { isNew });
    setFieldErrors(errors);
    setFormError(null);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      // Reprend la recherche faite en quittant le champ (ou la lance si besoin).
      const coords = await place.lookup(locationName);
      await onSubmit({
        title,
        description,
        date,
        // Lieu vide → null en base (pas de chaîne vide).
        locationName: locationName.trim() || null,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });
      // Succès : l'écran parent ferme le formulaire, on ne touche plus à l'état.
    } catch {
      setFormError(t.errorSave);
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      // Laisse la place de l'en-tête de navigation au-dessus du formulaire.
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Screen scroll edges={['bottom', 'left', 'right']}>
        <Input
          label={t.title}
          placeholder={t.titlePlaceholder}
          value={title}
          onChangeText={setTitle}
          error={fieldErrors.title}
          maxLength={TITLE_MAX_LENGTH}
          returnKeyType="next"
        />
        <Input
          label={t.description}
          placeholder={t.descriptionPlaceholder}
          value={description}
          onChangeText={setDescription}
          error={fieldErrors.description}
          multiline
        />
        <DateTimeField value={date} onChange={setDate} error={fieldErrors.date} />
        <Input
          label={t.location}
          placeholder={t.locationPlaceholder}
          value={locationName}
          onChangeText={setLocationName}
          autoComplete="street-address"
          textContentType="fullStreetAddress"
          returnKeyType="done"
          // En quittant le champ : on cherche le lieu et on montre ce qui a été compris.
          onBlur={() => place.lookup(locationName)}
        />
        {/* Seulement si le message correspond au texte actuel du champ. */}
        {place.display.query === locationName.trim() ? (
          <PlaceHint status={place.display.status} label={place.display.label} />
        ) : null}

        {formError ? <LiveText style={[typography.label, { color: colors.danger }]}>{formError}</LiveText> : null}

        <Button label={submitLabel} icon="check" onPress={submit} loading={submitting} />
        <Button variant="outline" label={fr.common.cancel} onPress={onCancel} disabled={submitting} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

/** Message sous le champ « Lieu » : recherche en cours, lieu reconnu ou introuvable. */
function PlaceHint({ status, label }: { status: PlaceStatus; label: string | null }) {
  const { colors } = useTheme();
  if (status === 'idle') return null;
  const text =
    status === 'searching'
      ? t.placeSearching
      : status === 'notFound'
        ? t.placeNotFound
        : label
          ? t.placeFound(label)
          : t.placeFoundNoLabel;
  return (
    // « polite » : le lecteur d'écran annonce le résultat de la recherche.
    <Text accessibilityLiveRegion="polite" style={[typography.caption, styles.hint, { color: colors.muted }]}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // L'écran espace ses éléments de spacing.lg : on rapproche le message de son champ.
  hint: { marginTop: -spacing.sm },
});
