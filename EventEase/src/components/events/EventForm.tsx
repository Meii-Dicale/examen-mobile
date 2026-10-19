/**
 * Formulaire partagé entre la création et la modification d'un événement.
 * L'écran fournit les valeurs de départ et ce qu'il faut faire à l'envoi
 * (`onSubmit`) : le formulaire, lui, gère la saisie, la validation et les erreurs.
 */

import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { LiveText } from '@/components/common/LiveText';
import { Button, Input, Screen } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import type { EventInput } from '@/types/event';

import { DateTimeField } from './DateTimeField';
import { typography } from '@/theme/tokens';
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

  const submit = async () => {
    const errors = validateEvent({ title, description, date }, { isNew });
    setFieldErrors(errors);
    setFormError(null);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      // Lieu vide → null en base (pas de chaîne vide).
      await onSubmit({ title, description, date, locationName: locationName.trim() || null });
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
        />

        {formError ? <LiveText style={[typography.label, { color: colors.danger }]}>{formError}</LiveText> : null}

        <Button label={submitLabel} icon="check" onPress={submit} loading={submitting} />
        <Button variant="outline" label={fr.common.cancel} onPress={onCancel} disabled={submitting} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
