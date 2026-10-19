import { fr } from '@/i18n/fr';
import { AuthError } from '@/services/users';

/** Traduit une erreur de connexion / inscription en message lisible. */
export function authErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    return error.code === 'email-taken' ? fr.auth.errorEmailTaken : fr.auth.errorInvalidCredentials;
  }
  // Erreur inattendue (base, stockage) : message générique, sans détail technique.
  return fr.auth.errorUnknown;
}
