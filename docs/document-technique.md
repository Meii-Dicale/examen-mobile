# EventEase — document technique

Lorelei WANNYN · Examen CDA mobile · Octobre 2026

1. **Stack** : Expo SDK 57, React Native et TypeScript strict. L'app tourne dans Expo Go, sans build natif.
2. **Navigation** : Expo Router, construit sur React Navigation. Les groupes `(auth)` et `(app)` sont protégés par `Stack.Protected` : sans session, on ne voit que la connexion et l'inscription. Une fois connecté·e, trois onglets s'affichent : Événements, Calendrier et Profil.
3. **Architecture en couches** : écran → hook → service → SQLite ou API. Aucun SQL ni `fetch` dans un composant. Les écrans lisent leurs données avec `useFocusQuery`, qui recharge à chaque retour sur l'écran.
4. **Données** : expo-sqlite, avec quatre tables (`users`, `events`, `participations`, `event_photos`) et des clés étrangères `ON DELETE CASCADE`. Les migrations sont versionnées par `PRAGMA user_version`, et le seed de démo n'est inséré qu'à la création de la base.
5. **Sécurité** :
   - Les mots de passe sont hachés en SHA-256 avec un sel aléatoire, jamais stockés en clair.
   - La session (l'id de l'utilisateur) est gardée dans SecureStore.
   - Toutes les requêtes sont paramétrées (`?`), ce qui protège des injections SQL.
   - Seul le créateur peut modifier ou supprimer un événement : la condition `AND created_by = ?` est dans la requête elle-même, pas seulement dans l'interface.
6. **État global** : seulement deux contextes, `AuthContext` (la session) et `ThemeContext` (clair ou sombre, sauvegardé dans AsyncStorage). Tout le reste est un état local aux hooks.
7. **Bonus** :
   - le calendrier, avec react-native-calendars, et l'ajout à l'agenda du téléphone avec expo-calendar, sans doublon ;
   - la météo OpenWeather (prévision sur 5 jours ; la clé est dans `.env`, jamais versionné) ;
   - le géocodage du lieu et la distance calculée par Haversine (expo-location) ;
   - les photos d'un événement passé auquel on a participé : le fichier est copié dans le dossier de l'app.
8. **Dégradation propre** : si une permission est refusée, ou s'il n'y a pas de réseau ou de clé API, la fonctionnalité concernée est masquée et le reste de l'app continue de marcher.
9. **Design** : la palette Prune & pêche est conforme WCAG AA en clair et en sombre. Elle utilise la police Montserrat, le logo « ticket validé » et un splash animé avec Reanimated.
10. **Qualité** : une branche par fonctionnalité et une pull request vers `main`. La CI GitHub Actions vérifie la compatibilité des dépendances (`expo install --check`), le lint et le typage (`tsc --noEmit`). Une règle sur `main` interdit le push direct.
