/**
 * Hachage des mots de passe : on ne stocke JAMAIS un mot de passe en clair.
 *
 * - Le sel est une valeur aléatoire propre à chaque utilisateur. Deux comptes avec
 *   le même mot de passe ont donc des empreintes différentes, et des tables
 *   d'empreintes précalculées (« rainbow tables ») ne servent à rien.
 * - L'empreinte est SHA-256(sel + mot de passe). À la connexion, on recalcule
 *   l'empreinte avec le sel enregistré et on compare.
 *
 * Limite à connaître : SHA-256 est un hachage rapide. Sur un vrai serveur, on
 * utiliserait un hachage volontairement lent (bcrypt, argon2) pour freiner les
 * attaques par force brute. Pour un prototype sans backend, c'est suffisant.
 */

import * as Crypto from 'expo-crypto';

/** Sel aléatoire (UUID v4, généré avec un aléa cryptographique). */
export function createSalt(): string {
  return Crypto.randomUUID();
}

/** Empreinte hexadécimale du mot de passe, combinée avec le sel. */
export function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}
