# EventEase

Prototype d'application mobile React Native pour l'association fictive EventEase. Les membres et bénévoles peuvent consulter les événements, en créer, les modifier, les supprimer et marquer leur participation. Toutes les données sont stockées sur le téléphone, sans serveur.

Projet d'examen CDA (2ᵉ année), réalisé en 4 jours.

## Contenu du dépôt

| Dossier | Contenu |
|---|---|
| `EventEase/` | L'application Expo (React Native + TypeScript) |
| `docs/cahier-des-charges.pdf` | Le sujet de l'examen |
| `docs/plan-realisation.md` | Le plan : stack, modèle de données, arborescence, planning jour par jour |
| `docs/maquette-design.html` | La maquette : écrans, palette Prune & pêche, logo, contrastes WCAG |
| `.github/workflows/` | La CI qui vérifie le code à chaque pull request |

## Workflow Git

- `main` contient toujours une version qui fonctionne. On n'y pousse jamais directement.
- Chaque fonctionnalité a sa propre branche, créée depuis `main` : `feat/<nom>`, `fix/<nom>` ou `docs/<nom>`.
- Quand la fonctionnalité est prête, on ouvre une pull request vers `main`.
- La CI vérifie alors que le code n'est pas cassé :
  - les versions des dépendances sont compatibles avec le SDK Expo ;
  - le lint passe (`npx expo lint`) ;
  - le typage passe (`npx tsc --noEmit`) ;
  - les tests passent (quand ils seront ajoutés).
- On fusionne (squash) seulement si la CI est verte, puis on supprime la branche.

## Lancer l'application

Les instructions d'installation seront complétées au fil des branches : installation, compte de démo, clé OpenWeather.
