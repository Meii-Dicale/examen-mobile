# Plan de réalisation — EventEase (examen mobile, 4 jours)

## Contexte
Il s'agit de l'examen CDA : construire en 4 jours un prototype React Native pour l'association fictive EventEase. Les membres doivent pouvoir s'inscrire, consulter, créer, modifier et supprimer des événements, et marquer leur participation. La persistance est locale, sans backend.

Les choix ont été validés avec toi :
- Je code et je t'explique chaque fichier (commentaires en français), pour que tu puisses défendre le code.
- La persistance utilise **expo-sqlite**.
- Il n'y a pas de rôles : seul le créateur d'un événement peut le modifier ou le supprimer.
- Tous les bonus sont visés : calendrier, météo OpenWeather, design (thème + splash + logo), lieu + géolocalisation.
- Bonus personnel : ajouter des photos à un événement auquel on a participé.

La stack et les conventions sont reprises de tes projets `pokedexReactNative/` et `YouAreTheHero/mobile/`, pour que tu sois en terrain connu.

## Stack (identique à tes projets)
| Besoin | Choix | Repris de |
|---|---|---|
| Base | Expo SDK 57, TypeScript strict, alias `@/*` → `src/*`, `typedRoutes` | Pokédex |
| Navigation | Expo Router, construit **sur React Navigation**, ce qui respecte la contrainte du sujet. Groupes `(auth)` / `(app)` avec `Stack.Protected`, et `(tabs)` | YouAreTheHero `app/_layout.tsx` |
| Données | `expo-sqlite` (`SQLiteProvider` + `useSQLiteContext`) | nouveau |
| Session | `expo-secure-store` (id de l'utilisateur connecté) | YouAreTheHero `services/tokenStorage.ts` |
| Mot de passe | `expo-crypto` (SHA-256 + sel), jamais stocké en clair | nouveau |
| État global | `AuthContext` + `ThemeContext` ; tout le reste en `useState` dans des hooks | les deux projets |
| Appels API | `fetch` dans `services/`, hook `{data, loading, error, reload}` avec `AbortController` | Pokédex `usePokemonList.ts` |
| Style | `StyleSheet` + tokens (`colors`, `spacing`, `radius`, `typography`), thème clair/sombre sauvegardé dans AsyncStorage | Pokédex `constants/theme.ts`, `ThemeContext.tsx` |
| Textes | `i18n/fr.ts` centralisé | YouAreTheHero |
| Qualité | `npx expo lint` + `npx tsc --noEmit` | les deux projets |

Libs à ajouter, toujours via `npx expo install` : `expo-sqlite`, `expo-secure-store`, `expo-crypto`, `@react-native-async-storage/async-storage`, `@react-native-community/datetimepicker`, `react-native-calendars`, `expo-calendar`, `expo-location`, `expo-image-picker`, `expo-file-system`, `expo-image`, `expo-splash-screen`, `@expo/vector-icons`, `@expo-google-fonts/montserrat` (la police du logo).

## Modèle de données (SQLite)
```
users(id PK, email UNIQUE, name, password_hash, salt, created_at)
events(id PK, title, description, date ISO, location_name, latitude NULL, longitude NULL,
       created_by FK→users ON DELETE CASCADE, created_at, updated_at)
participations(user_id FK, event_id FK ON DELETE CASCADE, created_at,
               device_calendar_event_id NULL, PK(user_id, event_id))
event_photos(id PK, event_id FK ON DELETE CASCADE, user_id FK, uri, created_at)
```
- Les migrations sont versionnées avec `PRAGMA user_version` dans `onInit` du `SQLiteProvider`, avec `PRAGMA foreign_keys = ON`.
- Un seed crée un compte démo `demo@eventease.fr` / `demo1234` et quelques événements, pour la soutenance.
- Toutes les requêtes sont paramétrées (`?`), ce qui protège des injections SQL. C'est un bon argument à l'oral.

## Arborescence cible (`EventEase/`, à côté des deux autres projets)
```
src/app/
  _layout.tsx                 SQLiteProvider > ThemeProvider > AuthProvider, splash, Stack.Protected
  (auth)/index.tsx            Connexion
  (auth)/register.tsx         Inscription
  (app)/(tabs)/_layout.tsx    Onglets : Événements, Calendrier, Profil
  (app)/(tabs)/index.tsx      Liste (titre, description, date, badge "Je participe", distance)
  (app)/(tabs)/calendar.tsx   react-native-calendars + événements du jour sélectionné
  (app)/(tabs)/profile.tsx    Infos, mes participations, thème, déconnexion
  (app)/event/[id].tsx        Détail : météo, distance, bouton participer, photos, modifier/supprimer
  (app)/event/new.tsx         Création (modal)
  (app)/event/[id]/edit.tsx   Modification
src/db/          schema.ts (migrations), seed.ts
src/services/    users.ts, events.ts, participations.ts, photos.ts  (SQL)
                 deviceCalendar.ts (expo-calendar : agenda du téléphone)
                 weather.ts (OpenWeather), location.ts (permissions + geocode), session.ts (SecureStore)
src/hooks/       useAuth, useEvents, useEvent, useParticipation, useWeather, useUserLocation, useEventPhotos, useDeviceCalendar
src/context/     AuthContext.tsx, ThemeContext.tsx
src/components/  ui/ (Button, Input, Screen, Card), EventCard, EventForm (partagé entre création et modification),
                 WeatherBadge, DistanceBadge, PhotoGallery, EmptyState
src/theme/       colors.ts (palette Prune & pêche, clair + sombre), tokens.ts
src/utils/       distance.ts (Haversine), date.ts (formatage fr), validation.ts
src/types/       event.ts, user.ts, weather.ts
src/i18n/fr.ts
```
Règle reprise de YouAreTheHero : **pas de SQL ni de `fetch` dans un composant**. L'écran appelle un hook, le hook appelle un service, et le service parle à la base ou à l'API.

## Détails des fonctionnalités
- **Auth simplifiée** : l'inscription insère un utilisateur avec mot de passe haché. La connexion compare le hash, puis enregistre l'id dans SecureStore. Au démarrage, `AuthProvider` relit cet id pour restaurer la session. Les erreurs gérées sont : email déjà pris, mauvais mot de passe, champs vides.
- **CRUD** : `EventForm` contient un titre, une description, une date et heure (datetimepicker) et un lieu (texte). Au moment d'enregistrer, `Location.geocodeAsync(lieu)` calcule les coordonnées. Si le géocodage échoue, l'événement est quand même enregistré, sans distance. La suppression demande une confirmation avec `Alert.alert`. Modifier et supprimer ne sont visibles que pour le créateur.
- **Participation** : un toggle `INSERT` / `DELETE` dans `participations`. La liste affiche un badge et un compteur de participants.
- **Rafraîchissement** : `useFocusEffect(reload)`, comme dans YouAreTheHero.
- **Calendrier dans l'app** : `react-native-calendars` affiche les événements. `markedDates` est construit à partir des dates d'événements, et taper un jour filtre la liste en dessous.
- **Ajout à l'agenda du téléphone** avec `expo-calendar` (une autre librairie que react-native-calendars, qui ne fait qu'afficher) :
  - Un bouton « Ajouter à mon agenda » sur le détail. Il est aussi proposé dans une `Alert` juste après avoir cliqué sur « Je participe ».
  - Le service demande la permission avec `requestCalendarPermissionsAsync`, choisit le calendrier par défaut, puis crée l'événement avec titre, lieu, notes, date de début, date de fin (+2 h par défaut) et un rappel 1 h avant.
  - L'id renvoyé est enregistré dans `participations.device_calendar_event_id`. Ça évite les doublons (le bouton devient « Ajouté à ton agenda ») et permet de supprimer l'événement de l'agenda si on annule sa participation.
  - Si l'utilisateur refuse la permission, un message explique comment l'activer dans les réglages, et le reste de l'app fonctionne normalement.
  - La permission est déclarée dans `app.json` (plugin `expo-calendar`). On vérifiera l'API exacte dans la doc Expo SDK 57 au moment de coder.
- **Météo** : la clé est dans `.env` (`EXPO_PUBLIC_OPENWEATHER_KEY`, et `.env` est ignoré par git). L'appel utilise `/data/2.5/forecast` (lat/lon, `units=metric`, `lang=fr`) et prend le créneau le plus proche de l'heure de l'événement. Le gratuit ne prévoit que **5 jours** : au-delà, ou si l'événement est passé, on affiche « Prévision indisponible ».
- **Géolocalisation** : `expo-location` demande la permission au premier affichage, puis la distance Haversine est affichée en km sur la carte et sur le détail. Si l'utilisateur refuse, la distance est simplement masquée.
- **Photos (bonus perso)** : visibles seulement si l'utilisateur participe et que la date est passée. `expo-image-picker` propose la caméra ou la galerie. Le fichier est copié dans le dossier document de l'app avec `expo-file-system`, sinon l'URI temporaire disparaîtrait. L'URI est enregistrée dans `event_photos` et affichée dans une galerie horizontale avec `expo-image`. Un appui long supprime ses propres photos.
- **Design** : le thème clair/sombre utilise la palette Prune & pêche (voir « Décisions de design validées »). Le logo B (ticket validé) est exporté en PNG pour l'icône et le splash, et gardé en SVG pour l'écran de connexion.

## Décisions de design validées (maquette : docs/maquette-design.html)
- **Logo** : B, « le ticket validé », un ticket d'entrée avec une coche couleur pêche.
- **Palette** : Prune & pêche. Elle est conforme WCAG AA en clair et en sombre, avec un contraste minimum de 6:1.

| Token | Clair | Sombre |
|---|---|---|
| bg | #F8F4F7 | #1A1020 |
| surface | #FFFFFF | #26182E |
| text | #2A1730 | #F6EEF7 |
| muted | #62506A | #BBA8C2 |
| border | #E8DDE6 | #3B2845 |
| primary | #7A2E8E | #D99BEA |
| primarySoft | #F3E3F6 | #3E2149 |
| onPrimary | #FFFFFF | #1A1020 |
| accent | #FF9466 | #FFA680 |
| accentSoft | #FFE9DF | #41241A |
| accentInk | #9A3A10 | #FFC2A8 |
| onAccent | #2A1730 | #2A1730 |
| danger | #B42318 | #F07A6E |

- **Règle d'accessibilité** : `accent` sert seulement de fond (bouton +, carte météo). Le texte et les points du calendrier utilisent `accentInk`.
- **Police** : Montserrat. **Navigation** : 3 onglets (Événements, Calendrier, Profil) et un bouton + flottant pour créer.

## Workflow Git et CI
- Le dépôt est https://github.com/Meii-Dicale/examen-mobile. Les projets `pokedexReactNative/` et `YouAreTheHero/` sont ignorés par `.gitignore`.
- **Une branche par fonctionnalité**, créée depuis `main` (`feat/…`, `fix/…`, `docs/…`), puis une pull request vers `main`.
- **La CI** (`.github/workflows/mobile.yml`, reprise de YouAreTheHero) lance, dans `EventEase/` :
  1. `npm ci` ;
  2. `npx expo install --check` ;
  3. `npx expo lint` ;
  4. `npx tsc --noEmit` ;
  5. `npm test` (à partir du jour 4).
- **Une règle sur `main`** (ruleset GitHub) : pas de push direct, pull request obligatoire et CI verte. La fusion se fait en squash, puis la branche est supprimée.
- **Les étapes** : je code sur la branche, je pousse et j'ouvre la pull request. Tu relis le code avec mes explications, et on fusionne quand la CI est verte.

Branches prévues :

| Jour | Branche | Contenu |
|---|---|---|
| 1 | `feat/setup-projet` | Projet Expo, alias, CI, ruleset |
| 1 | `feat/theme-ui` | Tokens, ThemeContext, composants ui, fr.ts, polices |
| 1 | `feat/database` | SQLite : schéma, migrations, seed |
| 1 | `feat/auth` | Inscription, connexion, session, Stack.Protected, onglets |
| 2 | `feat/events-crud` | Liste, détail, formulaire, création, modification, suppression |
| 2 | `feat/participation` | Participer, profil, mes participations |
| 3 | `feat/calendar` | react-native-calendars et agenda du téléphone (expo-calendar) |
| 3 | `feat/location` | Géocodage et distance |
| 3 | `feat/weather` | OpenWeather |
| 3 | `feat/photos` | Photos d'événement |
| 3 | `feat/design-finitions` | Splash, icône, états vides |
| 4 | `test/utils` | jest-expo et tests des utils |
| 4 | `docs/soutenance` | README, document technique |

## Planning (4 jours)
**Étape 0 — maquette de design (avant tout code)**
- Créer une maquette HTML statique : `docs/maquette-design.html`, publiée aussi en Artifact pour la voir dans le navigateur.
- Elle montre les écrans dans des cadres de téléphone :
  - splash ;
  - connexion et inscription ;
  - liste des événements ;
  - détail (météo, distance, participation, photos) ;
  - formulaire de création ;
  - calendrier ;
  - profil.
- Elle inclut la palette (Prune & pêche, retenue après comparaison), la typo Montserrat, les composants (boutons, cartes, badges) et le mode clair/sombre.
- Tu la valides ou tu la fais ajuster. Les tokens validés deviennent ensuite `src/theme/colors.ts` et `tokens.ts`.

**Jour 1 — base et navigation**
1. `npx create-expo-app EventEase`, nettoyage du template, alias, ESLint, `git init`.
2. Thème, tokens, `fr.ts`, composants `ui/`.
3. SQLite : schéma, migrations, seed.
4. AuthContext, session, écrans connexion et inscription, `Stack.Protected`, onglets vides.
5. ✅ Fin de journée : on peut s'inscrire, se connecter, se déconnecter, et la session survit à un redémarrage.

**Jour 2 — CRUD et participation (le cœur noté sur 8 + 2 points)**
6. `services/events.ts` et les hooks, puis liste, détail, `EventForm`, création, modification, suppression.
7. Participation et page profil (mes participations).
8. ✅ Toutes les fonctionnalités obligatoires sont faites et persistées. On fait un commit « MVP ».

**Jour 3 — bonus**
9. Calendrier dans l'app, ajout à l'agenda du téléphone (`expo-calendar`), puis lieu, géocodage et distance, puis météo.
10. Photos d'événement.
11. Splash, icône, polices, mode sombre, états vides et de chargement.

**Jour 4 — finition et soutenance**
12. Passe lint + tsc, relecture des commentaires, cas limites (champs vides, permission refusée, pas de réseau).
13. Tests unitaires légers avec `jest-expo` sur `utils/` (Haversine, validation, format de date). Ils sont faciles à montrer.
14. README (installation, compte démo, clé API), mini-document technique de 10 lignes, script de démo de 10 minutes, et une session où je te pose des questions comme le jury.

Ordre de priorité si on prend du retard : obligatoires → design → calendrier (affichage + agenda du téléphone) → géoloc → météo → photos.

## Comment je t'accompagne
- Pour chaque étape, j'écris le code, puis je t'explique le rôle du fichier, le flux de données et les notions à connaître (Context, hooks, `useEffect`, requêtes SQL paramétrées, permissions).
- Je te fais tester sur Expo Go avant de passer à l'étape suivante.
- Il y a un commit Git par étape, ce qui fait un historique propre à montrer.

## Vérification
- `npx expo lint` et `npx tsc --noEmit` sans erreur à chaque étape.
- Scénario manuel sur Expo Go (téléphone) :
  1. Inscription, puis tuer l'app et la relancer : toujours connecté.
  2. Créer, modifier et supprimer un événement ; un autre compte ne voit pas les boutons d'édition.
  3. Participer, puis relancer l'app : la participation est conservée.
  4. Le calendrier affiche bien les marqueurs, la distance apparaît avec la permission et disparaît sans elle, et la météo s'affiche pour un événement dans moins de 5 jours. « Ajouter à mon agenda » crée bien l'événement dans l'app Calendrier du téléphone, sans doublon si on appuie deux fois.
  5. Ajouter une photo à un événement passé auquel on a participé, puis relancer l'app : la photo est toujours là.
- `npx jest` sur les utils (jour 4).
