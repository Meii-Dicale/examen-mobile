# EventEase — application mobile

L'application Expo (SDK 57, React Native, TypeScript). L'installation, les comptes de démo et la configuration de la clé OpenWeather sont décrits dans le [README du dépôt](../README.md). L'architecture est résumée dans le [document technique](../docs/document-technique.md).

```
src/app/         écrans et navigation (Expo Router)
src/components/  composants d'interface
src/hooks/       logique des écrans (chargement, états)
src/services/    accès à SQLite et aux API (météo, agenda, localisation)
src/db/          schéma, migrations et données de démo
src/context/     session et thème
src/theme/       couleurs et tokens de design
src/types/       types TypeScript partagés
src/utils/       fonctions pures (dates, distance, validation)
src/i18n/fr.ts   tous les textes de l'app
```
