/**
 * Contexte de session, repris de YouAreTheHero (AuthProvider.tsx).
 *
 * Il sait qui est connecté (`user`) et expose les actions signIn / signUp / signOut.
 * Le layout racine lit `user` pour choisir les écrans accessibles (Stack.Protected) :
 * les écrans n'ont donc jamais à faire de redirection eux-mêmes.
 */

import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { clearSession, loadSessionUserId, saveSessionUserId } from '@/services/session';
import { authenticate, createUser, getUserById } from '@/services/users';
import type { User } from '@/types/user';

type AuthContextValue = {
  /** true pendant la restauration de la session au démarrage. */
  isLoading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Ce Provider est sous <SQLiteProvider> : la base est déjà ouverte et migrée.
  const db = useSQLiteContext();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Au démarrage : on relit l'id enregistré et on recharge l'utilisateur depuis la base.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const id = await loadSessionUserId();
        const saved = id != null ? await getUserById(db, id) : null;
        // Id enregistré mais compte introuvable (base réinstallée) : on nettoie.
        if (id != null && !saved) await clearSession();
        if (!cancelled) setUser(saved);
      } catch {
        // En cas de problème, on démarre simplement déconnecté.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [db]);

  // useMemo : le même objet tant que rien ne change, pour ne pas re-rendre
  // inutilement tous les composants qui utilisent useAuth().
  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      user,
      async signIn(email, password) {
        // authenticate lève une AuthError si les identifiants sont faux : l'écran l'affiche.
        const signedIn = await authenticate(db, email, password);
        await saveSessionUserId(signedIn.id);
        setUser(signedIn);
      },
      async signUp(input) {
        // Après l'inscription, on est connecté directement.
        const created = await createUser(db, input);
        await saveSessionUserId(created.id);
        setUser(created);
      },
      async signOut() {
        await clearSession();
        setUser(null);
      },
    }),
    [db, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

/**
 * Id de l'utilisateur connecté, pour les écrans du groupe (app).
 *
 * Ne lève pas d'erreur si personne n'est connecté : à la déconnexion, `user` passe
 * à null un instant AVANT que Stack.Protected retire ces écrans. On renvoie alors 0,
 * qui ne correspond à aucun compte (les id AUTOINCREMENT commencent à 1).
 */
export function useCurrentUserId(): number {
  const { user } = useAuth();
  return user?.id ?? 0;
}
