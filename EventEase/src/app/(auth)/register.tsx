/**
 * Écran d'inscription. Même principe que la connexion :
 * validation locale, puis création en base ; une fois inscrit·e, on est connecté·e
 * et Stack.Protected affiche l'app.
 */

import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthSwitchLink } from '@/components/auth/AuthSwitchLink';
import { LiveText } from '@/components/common/LiveText';
import { Button, Input, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { authErrorMessage } from '@/i18n/authErrorMessage';
import { fr } from '@/i18n/fr';
import { typography } from '@/theme/tokens';
import { hasErrors, validateRegister, type FieldErrors } from '@/utils/validation';

const t = fr.auth;

type Field = 'name' | 'email' | 'password' | 'confirm';

export default function Register() {
  const { colors } = useTheme();
  const { signUp } = useAuth();
  // Un seul état pour les 4 champs : un objet, mis à jour champ par champ.
  const [form, setForm] = useState<Record<Field, string>>({ name: '', email: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Renvoie le gestionnaire onChangeText d'un champ donné.
  const update = (field: Field) => (value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    const errors = validateRegister(form);
    setFieldErrors(errors);
    setFormError(null);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      await signUp({ name: form.name, email: form.email, password: form.password });
    } catch (error) {
      // Cas typique : e-mail déjà utilisé (contrainte UNIQUE en base).
      setFormError(authErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll>
        <AuthHeader title={t.registerTitle} subtitle={t.registerSubtitle} />

        <Input
          label={t.name}
          placeholder={t.namePlaceholder}
          value={form.name}
          onChangeText={update('name')}
          error={fieldErrors.name}
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
        />
        <Input
          label={t.email}
          placeholder={t.emailPlaceholder}
          value={form.email}
          onChangeText={update('email')}
          error={fieldErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <Input
          label={t.password}
          placeholder={t.passwordPlaceholder}
          value={form.password}
          onChangeText={update('password')}
          error={fieldErrors.password}
          secureTextEntry
          // « new-password » : iOS propose de générer un mot de passe fort.
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
        />
        <Input
          label={t.confirm}
          value={form.confirm}
          onChangeText={update('confirm')}
          error={fieldErrors.confirm}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
        />

        {formError ? <LiveText style={[typography.label, { color: colors.danger }]}>{formError}</LiveText> : null}

        <Button label={t.signUp} icon="user-plus" onPress={submit} loading={submitting} />

        {/* dismissTo : on revient à la connexion déjà ouverte, sans en empiler une deuxième. */}
        <AuthSwitchLink question={t.hasAccount} action={t.toLogin} href="/" dismissTo />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
