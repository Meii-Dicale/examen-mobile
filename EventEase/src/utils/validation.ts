/**
 * Validation des formulaires de connexion et d'inscription.
 * Fonctions pures (pas de React, pas de base) : faciles à tester unitairement.
 * Chaque fonction renvoie les erreurs par champ ; un objet vide = formulaire valide.
 */

import { fr } from '@/i18n/fr';
import { isPast } from '@/utils/date';

export const TITLE_MAX_LENGTH = 80;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

export function validateLogin(input: { email: string; password: string }): FieldErrors<'email' | 'password'> {
  const errors: FieldErrors<'email' | 'password'> = {};
  if (!isValidEmail(input.email)) errors.email = fr.auth.errorEmail;
  if (!input.password) errors.password = fr.auth.errorPasswordRequired;
  return errors;
}

export function validateRegister(input: {
  name: string;
  email: string;
  password: string;
  confirm: string;
}): FieldErrors<'name' | 'email' | 'password' | 'confirm'> {
  const errors: FieldErrors<'name' | 'email' | 'password' | 'confirm'> = {};
  if (!input.name.trim()) errors.name = fr.auth.errorNameRequired;
  if (!isValidEmail(input.email)) errors.email = fr.auth.errorEmail;
  if (input.password.length < PASSWORD_MIN_LENGTH) errors.password = fr.auth.errorPasswordLength;
  if (input.confirm !== input.password) errors.confirm = fr.auth.errorConfirm;
  return errors;
}

/**
 * Formulaire d'événement. À la création (`isNew`), la date ne peut pas être passée.
 * À la modification, on l'autorise : on peut corriger un événement déjà terminé.
 */
export function validateEvent(
  input: { title: string; description: string; date: string },
  { isNew, now = new Date() }: { isNew: boolean; now?: Date },
): FieldErrors<'title' | 'description' | 'date'> {
  const errors: FieldErrors<'title' | 'description' | 'date'> = {};
  const title = input.title.trim();
  if (!title) errors.title = fr.eventForm.errorTitleRequired;
  else if (title.length > TITLE_MAX_LENGTH) errors.title = fr.eventForm.errorTitleLength;
  if (!input.description.trim()) errors.description = fr.eventForm.errorDescriptionRequired;
  if (isNew && isPast(input.date, now)) errors.date = fr.eventForm.errorDatePast;
  return errors;
}
