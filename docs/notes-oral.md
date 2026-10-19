# Notes pour l'oral — EventEase

Conseils et arguments notés au fil du projet. Ce fichier est mis à jour à chaque branche.

---

## 1. Le jour de la démo

- **Le Mac se connecte au partage de connexion de l'iPhone**, jamais au Wi-Fi de la salle.
  - Sur un Wi-Fi partagé, le téléphone peut ouvrir le serveur Expo d'un camarade : c'est arrivé pendant le projet.
  - Avec le partage de connexion, le téléphone et le Mac sont seuls sur le réseau, et l'adresse affichée commence par `172.20.10.`.
  - Le code passe directement du Mac au téléphone ; seuls les appels Internet (météo) utilisent les données mobiles.
- Lance `npx expo start -c` avant de passer, et vérifie que l'app s'ouvre.
- **Compte démo** : `demo@eventease.fr` / `demo1234`. Un second compte, `camille@eventease.fr` / `demo1234`, montre qu'on ne peut pas modifier l'événement de quelqu'un d'autre.
- Les données de démo sont datées **par rapport au jour du lancement**. Il y a donc toujours un événement dans moins de 5 jours (la météo s'affiche) et des événements passés (photos).

---

## 2. Choix techniques — « Pourquoi… ? »

**Pourquoi Expo SDK 57 et pas 58 ?**
Le SDK 58 venait de sortir, et Expo Go sur l'App Store ne le supportait pas encore (« Project is incompatible with this version of Expo Go »). Le 57 est celui de mes projets précédents (Pokédex, YouAreTheHero), testé et stable.

**Le sujet impose React Navigation, or tu utilises Expo Router ?**
Expo Router est construit **sur** React Navigation. Il ajoute le routage par fichiers : chaque fichier de `src/app/` est un écran. La contrainte est donc respectée.

**Pourquoi SQLite plutôt qu'AsyncStorage ?**
- Les données sont relationnelles : utilisateurs, événements, participations, photos.
- SQLite offre des **contraintes** : e-mail unique, une seule participation par personne et par événement, clés étrangères.
- Il offre aussi des **requêtes** (tri par date, comptage des participants) et la **suppression en cascade**.
- Avec AsyncStorage, tout cela serait à coder à la main sur du JSON.
- AsyncStorage ne sert qu'à une préférence d'affichage : le thème clair ou sombre.

---

## 3. Architecture

**Le flux des données** : écran → hook → service → base.
- Un écran ne contient jamais de SQL ni de `fetch`.
- Le **service** (`src/services/`) parle à la base ou à l'API.
- Le **hook** (`src/hooks/`) gère l'état et renvoie toujours `{ data, loading, error, reload }`.
- L'**écran** se contente d'afficher.
- Intérêt : chaque couche a une seule responsabilité, et on peut changer la base sans toucher aux écrans.

**Le hook générique `useFocusQuery`** (feat/events-crud)
- `useEvents` et `useEvent` ne font qu'appeler `useFocusQuery(requête)` : la logique chargement / erreur / annulation n'est écrite qu'**une fois**.
- Il utilise `useFocusEffect` et non `useEffect`. La requête est relancée **chaque fois que l'écran revient au premier plan** : après une création, le retour sur la liste suffit à la rafraîchir, sans système d'événements ni état global.
- Piège à connaître : la requête passée doit être **stable** (fonction du module ou `useCallback`). Sinon elle change à chaque rendu et la requête tourne en boucle.
- `useEventActions` fournit `create`, `update` et `remove` avec l'utilisateur connecté déjà injecté : un écran ne passe jamais de `userId`.

**Un formulaire partagé (`EventForm`)** : la création et la modification utilisent le même composant. Seuls les valeurs de départ, le libellé du bouton et l'action `onSubmit` changent. On n'écrit pas deux fois la même validation.

**Navigation des événements**
- `(app)` est une Stack contenant les onglets, avec le détail et la modification « poussés » par-dessus.
- La création s'ouvre en **modale** (`presentation: 'modal'`) : c'est une tâche courte qu'on ferme pour revenir où on était.
- L'id passe dans l'URL (`/event/[id]`). `useLocalSearchParams` le renvoie en **chaîne**, d'où le `Number(id)`.

**Participation** (feat/participation)
- Une seule requête par écran : le nombre de participants est une sous-requête `COUNT`, et « est-ce que je participe ? » vient d'un **`LEFT JOIN`** sur ma propre participation. On évite le **problème N+1** (une requête par carte).
- `LEFT JOIN participations mp ON mp.event_id = e.id AND mp.user_id = ?` : si je ne participe pas, la jointure ne trouve rien et `mp.user_id` vaut `NULL`. `mp.user_id IS NOT NULL` donne donc 0 ou 1 (SQLite n'a pas de booléen), converti en `true`/`false` dans `toEvent`. La jointure fournit en plus `device_calendar_event_id` (agenda du téléphone).
- Pas de lignes en double : la clé primaire `(user_id, event_id)` garantit au plus une participation par personne. Vérifié avec sqlite3.
- *Évolution* : la première version utilisait `EXISTS (…)`. Je suis passé·e au `LEFT JOIN` quand il a fallu lire aussi une colonne de la participation.
- La clé primaire `(user_id, event_id)` interdit les doublons. `INSERT OR IGNORE` rend un double appui sans effet.
- On peut aussi indiquer sa participation à un événement **passé** (« J'y ai participé »), ce qui ouvrira l'ajout de photos.
- Après un appui, on **relit** l'événement en base plutôt que de modifier l'état à la main : le bouton et le compteur restent forcément cohérents avec la base.

**`useCurrentUserId` et la déconnexion** (piège évité)
- À la déconnexion, `user` passe à `null` un instant **avant** que `Stack.Protected` retire les écrans connectés. Un hook qui lèverait une erreur ferait planter l'app à ce moment-là.
- Le hook renvoie donc 0, qui ne correspond à aucun compte (AUTOINCREMENT commence à 1). Même une écriture serait refusée par la clé étrangère : c'est vérifié avec sqlite3.

**Profil : onglets « À venir / Passés »** avec un composant `SegmentedControl` générique (`<T extends string>`) : TypeScript vérifie que les valeurs des options et de `onChange` sont les mêmes. Il est accessible (`accessibilityRole="tablist"` / `"tab"` et `accessibilityState.selected`) : VoiceOver annonce « onglet, sélectionné ». Le filtrage se fait en mémoire, sur la liste déjà chargée : pas de nouvelle requête au changement d'onglet.

**Calendrier** (feat/calendar) — deux librairies différentes, à ne pas confondre
- **`react-native-calendars`** : *affiche* un calendrier dans l'app (onglet Calendrier). Pur JavaScript, fonctionne dans Expo Go. Un point sous chaque jour qui a des événements (`markedDates`), et toucher un jour filtre la liste en dessous. Les données viennent du même hook `useEvents` que la liste : rien de nouveau en base.
- **`expo-calendar`** : *écrit* dans l'agenda du système (Calendrier iOS, Google Agenda). Bouton « Ajouter à mon agenda » sur le détail, et proposition dans une `Alert` juste après « Je participe ».
- **Pas de doublon** : l'id renvoyé par le système est enregistré dans `participations.device_calendar_event_id`. S'il existe, le bouton devient « Dans ton agenda », désactivé.
- **Annuler sa participation** retire aussi l'événement de l'agenda (`deleteEventAsync(id)`). Si l'utilisateur l'a déjà supprimé lui-même, l'erreur est ignorée : le résultat voulu est atteint.
- **iOS / Android** : iOS a un calendrier par défaut (`getDefaultCalendarAsync`), Android non. On y prend le calendrier principal (`isPrimary`) modifiable (`allowsModifications`).
- **Rappel** : une alarme 1 h avant (`relativeOffset: -60`). Durée : 2 h par défaut, car on ne stocke que l'heure de début.
- **Clé de jour en heure locale** (`toDayKey`) : `iso.slice(0, 10)` donnerait le jour en **UTC**. Un événement à 0 h 30 à Paris serait affiché la veille.
- **Thème** : la librairie ne relit pas `theme` après le premier rendu. Une `key` qui change entre clair et sombre force React à recréer le composant.
- **Limites assumées** : modifier un événement ne met pas à jour l'agenda, et une suppression par le créateur ne le nettoie pas chez les participant·es. Sans serveur, on ne peut pas prévenir les autres téléphones.

**Localisation et distance** (feat/location)
- **Deux usages d'`expo-location`** : la position du téléphone (`getUserPosition`) et le **géocodage** du lieu saisi (`geocodePlace` : « Place Bellecour, Lyon » → latitude/longitude). Le géocodeur est celui du système (Apple ou Google) : pas de clé d'API, mais il faut du réseau.
- **Géocodage à l'enregistrement, pas à l'affichage** : on calcule les coordonnées une fois, dans `useEventActions.create/update`, et on les stocke dans `events.latitude/longitude`. L'affichage n'a plus qu'un calcul mathématique à faire, sans réseau.
- **Modification** : si le lieu n'a pas changé, on garde les coordonnées existantes, sans nouvelle requête.
- **Échec = pas de distance, jamais d'erreur** : lieu introuvable, pas de réseau ou permission refusée → l'événement est enregistré quand même, et la distance est simplement masquée. Les fonctions du service renvoient `null` au lieu de lever une erreur.
- **Haversine** (`utils/distance.ts`) : distance « à vol d'oiseau » sur une sphère de 6 371 km, pas le trajet routier. Fonction pure, testable sans téléphone (Bellecour → Tête d'Or ≈ 2,8 km, Lyon → Paris ≈ 392 km).
- **Affichage** : « 350 m » sous 1 km (arrondi à 10 m, la position n'est pas plus précise), « 2,3 km » sous 10 km, puis « 12 km ». `toLocaleString('fr-FR')` met la virgule décimale.
- **Un Context pour la position** (`LocationProvider`) : la liste, le calendrier, le profil et le détail affichent des distances. La position est demandée **une seule fois** à l'entrée dans l'app, au lieu d'une fois par carte. Le Provider est dans le layout `(app)` : la permission est demandée après la connexion, pas sur l'écran de connexion.
- **Permission « pendant l'utilisation »** seulement (`requestForegroundPermissionsAsync`) : l'app n'a jamais besoin de suivre la personne en arrière-plan. Principe de **minimisation des données** (RGPD) : la position n'est ni stockée ni envoyée, elle reste en mémoire.
- **Précision `Balanced`** (~100 m) et `getLastKnownPositionAsync` d'abord : plus rapide et moins gourmand en batterie que le GPS fin, largement suffisant pour une distance en km.
- **Android** : le géocodage exige la permission de localisation (pas iOS), d'où le `Platform.OS === 'android'` dans `geocodePlace`.
- **Limites assumées** : position lue une fois par session (pas de suivi en temps réel) ; le géocodage peut se tromper sur un lieu ambigu (« Mairie ») : on prend le premier résultat.

**Règle des hooks** : dans le Profil, `useMyParticipations()` est appelé **avant** le `if (!user) return null`. React exige que les hooks soient appelés dans le même ordre à chaque rendu, jamais après un `return` conditionnel.

**Pourquoi `SectionList` et pas `.map()` ?** Elle ne rend que les cartes visibles (virtualisation), gère les sections « À venir / Passés » et le « tirer pour rafraîchir ».

**Pourquoi un Context pour le thème ?**
Sans lui, il faudrait passer `colors` en props à chaque composant (« prop drilling »). Avec `ThemeProvider` + `useTheme()`, n'importe quel composant y accède directement.

**Pourquoi `fr.ts` ?**
Aucun texte n'est écrit en dur dans les composants. L'orthographe se vérifie en un seul endroit, et une traduction future ne toucherait qu'un fichier.

**Pourquoi des tokens (`tokens.ts`) ?**
Aucune valeur magique (`16`, `'#7A2E8E'`) dans les écrans : changer un espacement ou une couleur se fait à un seul endroit, et l'app reste cohérente.

---

## 4. Base de données

- **Migrations avec `PRAGMA user_version`**
  - SQLite stocke un numéro de version, qui vaut 0 pour une base neuve. Au démarrage, on joue seulement les migrations qui manquent.
  - Pour modifier le schéma, on **ajoute** une migration ; on ne modifie jamais une migration existante, sinon les téléphones déjà installés ne la rejoueraient pas.
- **Une transaction par migration** : si une instruction échoue, tout est annulé. La base n'est jamais à moitié migrée.
- **`PRAGMA foreign_keys = ON` à chaque ouverture**
  - Par défaut, SQLite **ignore** les clés étrangères, et ce réglage n'est pas enregistré dans le fichier.
  - Sans lui, `ON DELETE CASCADE` ne ferait rien.
- **`ON DELETE CASCADE`** : supprimer un événement supprime ses participations et ses photos. Pas de lignes orphelines.
- **`COLLATE NOCASE` sur l'e-mail** : `Demo@EventEase.fr` et `demo@eventease.fr` sont considérés comme le même compte.
- **Clé primaire composée `(user_id, event_id)`** : on ne peut pas participer deux fois au même événement. C'est la base qui le garantit, pas seulement le code.
- **Dates en ISO 8601** (`2026-10-24T12:00:00.000Z`) : l'ordre alphabétique est aussi l'ordre chronologique, donc `ORDER BY date` fonctionne directement.
- **Index sur `events(date)`** : la liste est triée par date, et l'index évite de parcourir toute la table.
- **Requêtes paramétrées (`?`)** : les valeurs ne sont jamais concaténées dans le SQL. SQLite les échappe, ce qui protège des **injections SQL**.
- Les contraintes ont été **testées avec `sqlite3`** : doublon d'e-mail refusé, double participation refusée, créateur inexistant refusé, cascade vérifiée.

---

## 5. Sécurité

**Comment sont stockés les mots de passe ?**
- Jamais en clair : on stocke `SHA-256(sel + mot de passe)`.
- Le **sel** est aléatoire et propre à chaque utilisateur. Deux comptes avec le même mot de passe ont des empreintes différentes, et les tables d'empreintes précalculées (« rainbow tables ») sont inutiles.
- À la connexion, on recalcule l'empreinte avec le sel enregistré et on compare.

**Pourquoi pas bcrypt ou argon2 ?** (question probable)
- Je sais que SHA-256 est un hachage **rapide**, donc moins résistant à la force brute. bcrypt et argon2 sont volontairement **lents**.
- Les versions natives (`react-native-argon2`…) ne fonctionnent pas dans Expo Go : il faudrait un *development build*.
- `bcryptjs` (pur JavaScript) fonctionne, mais calcule sur le thread JS : environ 1 s d'interface figée à chaque connexion.
- Ici, les données ne quittent pas le téléphone. **Sur un vrai serveur, je hacherais avec argon2 côté back-end.**

**La session** (feat/auth)
- On ne garde que **l'id** de l'utilisateur, dans **SecureStore** (Keychain iOS / Keystore Android, chiffré par le système). AsyncStorage est en clair : il ne sert qu'au thème.
- Au démarrage, `AuthContext` relit l'id puis recharge l'utilisateur **depuis la base**. Si le compte n'existe plus, la session est effacée.
- L'objet `User` de l'app ne contient **jamais** le hash ni le sel (`toUser` ne garde que id, email, nom, date).

**Messages d'erreur de connexion** : le même message, « E-mail ou mot de passe incorrect », pour un e-mail inconnu et pour un mauvais mot de passe. Sinon, l'écran révèlerait quels e-mails ont un compte (énumération des comptes).

**E-mail déjà pris** : c'est la contrainte `UNIQUE COLLATE NOCASE` de la base qui refuse le doublon. On transforme l'erreur SQL en `AuthError('email-taken')`. C'est plus sûr qu'un `SELECT` avant l'`INSERT`, car la base est la seule source de vérité.

**Seul le créateur peut modifier ou supprimer — vérifié deux fois**
1. Dans l'interface, les boutons ne s'affichent que si `event.createdBy === user.id`.
2. **Dans la requête SQL** : `UPDATE … WHERE id = ? AND created_by = ?`. Si ce n'est pas le créateur, `changes` vaut 0 et le service lève une erreur.
- Pourquoi les deux ? Masquer un bouton n'est pas une sécurité : un lien direct vers `/event/3/edit` contournerait l'interface. C'est le principe « ne jamais faire confiance au client ». Sur un vrai back-end, cette vérification serait côté serveur.
- Testé avec sqlite3 : une modification par Camille d'un événement d'Alex donne `changes = 0`.

**Les secrets** : la clé OpenWeather est dans `.env`, exclu par le `.gitignore` : elle n'est jamais commitée. La checklist de chaque PR le vérifie.

**Navigation protégée : `Stack.Protected`**
- Dans le layout racine, le groupe `(auth)` n'existe que si `!user`, et `(app)` que si `user` existe.
- À la connexion ou à la déconnexion, `user` change et Expo Router bascule tout seul vers le bon groupe. **Aucun écran ne fait de `router.replace`**, et on ne peut pas atteindre un écran de l'app sans session, même avec un lien profond.
- Le splash reste affiché tant que la session n'est pas restaurée, pour éviter que l'écran de connexion « clignote » au démarrage.

---

## 6. Accessibilité

- **Contrastes WCAG niveau AA vérifiés** dans la maquette : 4.5:1 pour le texte, 3:1 pour les éléments d'interface. La palette Prune & pêche passe en clair comme en sombre.
- **Règle de la couleur pêche** : `accent` sert uniquement de **fond**. Pour écrire en orange, on utilise `accentInk`, plus foncé. Le pêche clair sur fond blanc ne passait pas les 3:1.
- **Zones tactiles d'au moins 48 px** (`touchTarget`).
- **Lecteurs d'écran** (VoiceOver / TalkBack)
  - Les boutons ont un `accessibilityRole`, un `accessibilityLabel` et un `accessibilityState` (désactivé, en cours).
  - Les erreurs de formulaire sont annoncées (`accessibilityLiveRegion`, composant `LiveText`).
  - Les titres d'écran ont `accessibilityRole="header"`, ce qui permet de naviguer de titre en titre. Les éléments décoratifs (pictogramme, avatar) sont masqués au lecteur.
- **Formulaires** : `autoComplete` et `textContentType` permettent le remplissage automatique par le gestionnaire de mots de passe. `new-password` propose un mot de passe fort à l'inscription.
- **Onglet actif** : il est signalé par une barre au-dessus de l'icône, pas seulement par la couleur.
- **Thème clair / sombre** : il suit le réglage du téléphone, et le choix de l'utilisateur est mémorisé.

---

## 7. Qualité et méthode de travail

- **Une branche par fonctionnalité** (`feat/…`, `fix/…`), puis une pull request vers `main`.
- **La CI GitHub Actions** s'exécute à chaque PR :
  1. `npm ci` installe exactement les versions du lockfile ;
  2. `expo install --check` vérifie les versions compatibles avec le SDK ;
  3. `expo lint` contrôle le style et les erreurs courantes ;
  4. `tsc --noEmit` vérifie les types.
- **Règle sur `main`** : pas de push direct, PR obligatoire, CI verte obligatoire, fusion en squash. **`main` fonctionne toujours.**
- **TypeScript strict** : beaucoup d'erreurs sont détectées avant même de lancer l'app.
- **Commentaires en français**, qui expliquent le *pourquoi* plutôt que le *quoi*.

---

## 8. Problèmes rencontrés et résolus

Le jury apprécie qu'on raconte un bug et sa démarche de résolution.

**L'écran blanc (le meilleur exemple à raconter)**
- *Symptôme* : écran blanc sans aucune erreur, de façon aléatoire.
- *Démarche* : j'ai ajouté des `console.log` à chaque étape du démarrage (polices, base, splash, écran), puis j'ai lu l'ordre des messages.
- *Indice* : `polices chargées : true`, mais le composant enfant recevait toujours `fontsReady = false`.
- *Cause* : en lisant le code source d'expo-sqlite, j'ai vu que `SQLiteProvider` est enveloppé dans `React.memo`, avec une comparaison qui ignore ses enfants. L'état des polices, placé au-dessus de lui, ne descendait jamais.
- *Correction* : déplacer `useFonts` **sous** le provider, pour que le changement d'état se produise dans le composant qui l'utilise.
- *Leçon* : `memo` évite des re-rendus inutiles, mais peut bloquer une mise à jour attendue. **L'état doit vivre au plus près de là où il est utilisé.**

**Le lint du React Compiler** (`set-state-in-effect`)
- *Problème* : il refusait un `setState` appelé directement dans un `useEffect`.
- *Correction* : j'ai repris le modèle de mon Pokédex. La fonction async est déclarée **dans** l'effet, et une `reloadKey` permet de recharger.
- Un drapeau `cancelled` évite d'écrire dans l'état d'un écran déjà quitté.

**« Tried to register two views with the same name RNDateTimePicker »**
- *Symptôme* : erreur rouge après avoir changé de branche (ou installé une librairie) pendant que Metro tournait.
- *Démarche* : la pile d'appels passait par `HMRClient injectUpdate`, donc par le **Fast Refresh**. J'ai vérifié avec `npm ls` qu'une seule copie de la librairie était installée.
- *Cause* : le Fast Refresh a ré-exécuté le module, qui a tenté d'enregistrer une deuxième fois son composant natif. Ce n'est pas un bug du code.
- *Correction* : recharger l'app (`r` dans Metro), ou `npx expo start -c` pour vider le cache.

**La nouvelle API d'`expo-calendar` absente d'Expo Go**
- *Constat* : en SDK 57, expo-calendar propose une nouvelle API orientée objet (`getDefaultCalendarSync()`, `calendar.createEvent()`). En lisant le code du paquet, j'ai vu que dans Expo Go elle est remplacée par une version vide qui lève une erreur.
- *Recherche* : la doc indique que l'API « legacy » (`expo-calendar/legacy`, fonctions `…Async`) est **incluse dans Expo Go**, documentée et maintenue.
- *Solution* : le service importe `expo-calendar/legacy`. On teste sur le téléphone sans *development build*. Le choix est isolé dans `services/deviceCalendar.ts` : passer à la nouvelle API ne toucherait que ce fichier.
- *Leçon* : vérifier la compatibilité Expo Go **avant** de choisir une API native, et garder le code natif derrière un service.

**Le mauvais projet ouvert dans Expo Go**
- Sur le Wi-Fi de l'école, Expo Go ouvrait le serveur d'un camarade.
- *Solution* : le partage de connexion du téléphone, qui crée un réseau isolé.

---

## 9. Questions probables du jury — réponses courtes

| Question | Réponse |
|---|---|
| Que se passe-t-il si on supprime un événement ? | Confirmation par `Alert`. Ensuite, `ON DELETE CASCADE` supprime ses participations et ses photos. |
| Comment empêches-tu un autre membre de modifier mon événement ? | Deux niveaux : les boutons ne s'affichent que pour le créateur, et la requête SQL contient `AND created_by = ?`. Même avec un lien direct, la base refuse (0 ligne modifiée). |
| Où sont stockées les données ? | Dans un fichier SQLite sur le téléphone (`eventease.db`). Le thème est dans AsyncStorage, la session dans SecureStore. |
| Que se passe-t-il si l'utilisateur refuse une permission ? | La fonctionnalité concernée est masquée ou expliquée, et le reste de l'app fonctionne. Agenda : une `Alert` explique le refus et propose « Ouvrir les réglages » (`Linking.openSettings()`), car le système ne redemande pas une permission refusée. Localisation : la distance est simplement masquée (le géocodage aussi sur Android), l'événement s'enregistre quand même. |
| Comment l'app sait que je suis connecté·e après un redémarrage ? | L'id est dans SecureStore. `AuthContext` le relit au démarrage et recharge l'utilisateur depuis SQLite. |
| Pourquoi un Context pour l'authentification ? | Plusieurs écrans et le layout ont besoin de `user`. Le Context évite de le passer en props partout, et `useMemo` évite des rendus inutiles. |
| Où est faite la validation ? | Dans `utils/validation.ts` : des fonctions pures, testables sans React. L'écran valide d'abord localement, puis interroge la base. |
| Pourquoi la redirection n'est pas dans l'écran de connexion ? | Avec `Stack.Protected`, c'est l'état `user` qui décide des écrans accessibles. C'est déclaratif, et il n'y a qu'un seul endroit à vérifier. |
| Comment la liste se met à jour après une création ? | Le hook charge dans `useFocusEffect` : quand la modale se ferme, la liste reprend le focus et relance la requête. |
| Pourquoi un sélecteur de date différent sur iOS et Android ? | Les composants natifs diffèrent. iOS a un sélecteur compact date + heure, Android seulement des boîtes de dialogue séparées, que j'ouvre avec `DateTimePickerAndroid.open`. Le formulaire reçoit toujours une date ISO. |
| Comment tries-tu les événements par date ? | Les dates sont en ISO 8601, donc l'ordre alphabétique est l'ordre chronologique : un simple `ORDER BY date`, avec un index sur la colonne. |
| Pourquoi une confirmation avant de supprimer ? | La suppression est définitive et entraîne celle des participations (CASCADE). L'`Alert` native évite une erreur sur un appui accidentel. |
| Comment sais-tu si je participe, pour chaque carte ? | Un `LEFT JOIN` sur ma participation, dans la même requête que la liste : une seule requête pour tout l'écran, pas une par carte (problème N+1). |
| Quelle différence entre react-native-calendars et expo-calendar ? | La première *affiche* un calendrier dans l'app. La seconde *écrit* dans l'agenda du téléphone, avec une permission système. |
| Comment évites-tu d'ajouter deux fois l'événement à l'agenda ? | L'id renvoyé par le système est enregistré dans `participations.device_calendar_event_id`. S'il est présent, le bouton est désactivé et l'action ne fait rien. |
| Pourquoi `expo-calendar/legacy` et pas la nouvelle API ? | La nouvelle API orientée objet n'est pas incluse dans Expo Go en SDK 57. La version legacy l'est, et elle est toujours documentée. Tout est dans un seul service : migrer ne toucherait qu'un fichier. |
| Que se passe-t-il si j'appuie deux fois sur « Je participe » ? | La clé primaire composite interdit le doublon, et `INSERT OR IGNORE` ignore la seconde insertion sans erreur. Le bouton est aussi désactivé pendant l'enregistrement. |
| Comment calcules-tu la distance ? | Formule de Haversine entre ma position et les coordonnées du lieu : distance à vol d'oiseau sur une sphère de 6 371 km. Fonction pure dans `utils/distance.ts`. |
| D'où viennent les coordonnées du lieu ? | Du géocodage (`Location.geocodeAsync`) au moment d'enregistrer l'événement. Elles sont stockées en base : l'affichage ne refait pas d'appel réseau. |
| Stockes-tu la position de l'utilisateur ? | Non. Elle reste en mémoire (Context), n'est ni enregistrée ni envoyée, et seule la permission « pendant l'utilisation » est demandée. |
| Pourquoi un Context pour la position ? | Plusieurs écrans affichent des distances. Le Context la demande une fois pour tous, au lieu d'interroger le GPS pour chaque carte. |
| Pourquoi « 3 personnes participent » et pas « participants » ? | C'est une formulation neutre, sans accord au genre, qui gère aussi le pluriel et le passé. |
| Pourquoi des hooks personnalisés ? | Pour séparer la logique (chargement, erreurs) de l'affichage, et la réutiliser sur plusieurs écrans. |
| `useEffect` : à quoi sert la fonction renvoyée ? | C'est le nettoyage : elle s'exécute quand l'écran est démonté ou avant le prochain effet (annuler un minuteur, ignorer une requête en cours). |
