/**
 * Accès à la table `users` : inscription, connexion, lecture.
 * Toutes les requêtes sont paramétrées (« ? ») : aucune injection SQL possible.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import { createSalt, hashPassword } from '@/services/password';
import type { User } from '@/types/user';

/** Erreur « métier » : l'écran affiche un message selon son `code`. */
export class AuthError extends Error {
  constructor(public readonly code: 'email-taken' | 'invalid-credentials') {
    super(code);
    this.name = 'AuthError';
  }
}

/** Ligne brute de la table (snake_case, comme en SQL). */
type UserRow = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  salt: string;
  created_at: string;
};

/** Ligne SQL → objet de l'app (camelCase, sans le hash ni le sel). */
function toUser(row: UserRow): User {
  return { id: row.id, email: row.email, name: row.name, createdAt: row.created_at };
}

export async function getUserById(db: SQLiteDatabase, id: number): Promise<User | null> {
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', id);
  return row ? toUser(row) : null;
}

export async function createUser(
  db: SQLiteDatabase,
  input: { email: string; name: string; password: string },
): Promise<User> {
  const salt = createSalt();
  const passwordHash = await hashPassword(input.password, salt);
  try {
    const result = await db.runAsync(
      'INSERT INTO users (email, name, password_hash, salt) VALUES (?, ?, ?, ?)',
      input.email.trim(),
      input.name.trim(),
      passwordHash,
      salt,
    );
    const user = await getUserById(db, result.lastInsertRowId);
    if (!user) throw new Error('Utilisateur introuvable après insertion');
    return user;
  } catch (e) {
    // C'est la contrainte UNIQUE de la base qui refuse le doublon (sans tenir
    // compte des majuscules, grâce à COLLATE NOCASE) : pas besoin d'un SELECT avant.
    if (e instanceof Error && e.message.includes('UNIQUE')) {
      throw new AuthError('email-taken');
    }
    throw e;
  }
}

/** Renvoie l'utilisateur si l'e-mail et le mot de passe correspondent. */
export async function authenticate(db: SQLiteDatabase, email: string, password: string): Promise<User> {
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE email = ?', email.trim());
  // On recalcule l'empreinte avec le sel enregistré, puis on compare.
  if (!row || (await hashPassword(password, row.salt)) !== row.password_hash) {
    // Même erreur pour « e-mail inconnu » et « mauvais mot de passe » :
    // on ne révèle pas quels e-mails ont un compte.
    throw new AuthError('invalid-credentials');
  }
  return toUser(row);
}
