# EventEase

Prototype d'application mobile React Native pour l'association fictive EventEase. Les membres et bénévoles peuvent consulter les événements, en créer, les modifier, les supprimer et marquer leur participation. Toutes les données sont stockées sur le téléphone, sans serveur.

Projet d'examen CDA (2ᵉ année) de Lorelei WANNYN, réalisé en 4 jours.

## Contenu du dépôt

| Dossier | Contenu |
|---|---|
| `EventEase/` | L'application Expo (React Native + TypeScript) |
| `docs/cahier-des-charges.pdf` | Le sujet de l'examen |
| `docs/plan-realisation.md` | Le plan : stack, modèle de données, arborescence, planning jour par jour |
| `docs/maquette-design.html` | La maquette : écrans, palette Prune & pêche, logo, contrastes WCAG |
| `docs/document-technique.md` | Le document technique : architecture et choix techniques en 10 points |
| `docs/soutenance.html` | Le diaporama de la soutenance (à ouvrir dans un navigateur) |
| `docs/notes-oral.md` | Les notes pour préparer l'oral |
| `.github/workflows/` | La CI qui vérifie le code à chaque pull request |

## Workflow Git

- `main` contient toujours une version qui fonctionne. On n'y pousse jamais directement.
- Chaque fonctionnalité a sa propre branche, créée depuis `main` : `feat/<nom>`, `fix/<nom>` ou `docs/<nom>`.
- Quand la fonctionnalité est prête, on ouvre une pull request vers `main`.
- La CI vérifie alors que le code n'est pas cassé :
  - les versions des dépendances sont compatibles avec le SDK Expo ;
  - le lint passe (`npx expo lint`) ;
  - le typage passe (`npx tsc --noEmit`).
- On fusionne (squash) seulement si la CI est verte, puis on supprime la branche.

## Lancer l'application

Prérequis : Node.js 20 ou plus, et l'app **Expo Go** sur le téléphone.

```bash
cd EventEase
npm install
cp .env.example .env   # puis y coller sa clé OpenWeather (facultatif)
npx expo start         # scanner le QR code avec Expo Go
```

Sans clé OpenWeather, l'app fonctionne normalement : la météo est simplement masquée.

### Comptes de démonstration

| Email | Mot de passe | Rôle dans la démo |
|---|---|---|
| `demo@eventease.fr` | `demo1234` | Alex Martin, le compte de la soutenance |
| `camille@eventease.fr` | `demo1234` | Camille Bernard, pour montrer qu'on ne peut pas modifier l'événement de quelqu'un d'autre |

Les événements de démo sont créés une seule fois, à la création de la base. Pour repartir d'une base neuve, il faut effacer les données d'Expo Go (Android) ou réinstaller Expo Go (iPhone).

### Vérifier le code

```bash
cd EventEase
npm run lint        # ESLint (npx expo lint)
npm run typecheck   # TypeScript (npx tsc --noEmit)
```

### Présenter le diaporama

Ouvrir `docs/soutenance.html` dans un navigateur.
- Flèches ou espace : changer de slide.
- `N` : afficher les notes d'orateur.
- `F` : plein écran.
- `Cmd + P` : exporter en PDF.
