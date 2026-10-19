/**
 * Écran de connexion (première route du groupe (auth)).
 * La redirection après connexion n'est pas faite ici : dès que `user` existe,
 * Stack.Protected du layout racine affiche le groupe (app).
 */

import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthSwitchLink } from '@/components/auth/AuthSwitchLink';
import { LiveText } from '@/components/common/LiveText';
import { Button, Input, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { authErrorMessage } from '@/i18n/authErrorMessage';
import { fr } from '@/i18n/fr';
import { radius, spacing, typography } from '@/theme/tokens';
import { hasErrors, validateLogin, type FieldErrors } from '@/utils/validation';

const t = fr.auth;

export default function Login() {
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Erreurs sous chaque champ (format), et erreur générale (identifiants refusés).
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<'email' | 'password'>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    // 1. Validation locale : inutile d'interroger la base si le format est faux.
    const errors = validateLogin({ email, password });
    setFieldErrors(errors);
    setFormError(null);
    if (hasErrors(errors)) return;

    // 2. Vérification en base.
    setSubmitting(true);
    try {
      await signIn(email, password);
      // Succès : l'écran disparaît (Stack.Protected), on ne touche plus à son état.
    } catch (error) {
      setFormError(authErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    // Sur iOS, le clavier recouvrirait le bouton : on remonte le contenu.
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll>
        <AuthHeader title={t.loginTitle} subtitle={t.loginSubtitle} />

        <Input
          label={t.email}
          placeholder={t.emailPlaceholder}
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          // Permet le remplissage automatique par le gestionnaire de mots de passe.
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <Input
          label={t.password}
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          // « Entrée » sur le clavier valide le formulaire.
          onSubmitEditing={submit}
        />

        {formError ? <LiveText style={[typography.label, { color: colors.danger }]}>{formError}</LiveText> : null}

        <Button label={t.signIn} icon="log-in" onPress={submit} loading={submitting} />

        {/* Aide pour la démonstration (compte créé par le seed). */}
        <View style={[styles.demo, { backgroundColor: colors.accentSoft }]}>
          <Text style={[typography.caption, { color: colors.accentInk }]}>{t.demoHint}</Text>
        </View>

        <AuthSwitchLink question={t.noAccount} action={t.toRegister} href="/register" />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  demo: { borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
});
