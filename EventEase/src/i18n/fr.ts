/**
 * Tous les textes de l'interface, regroupés par écran (repris de YouAreTheHero).
 * Avantages : aucun texte en dur dans les composants, orthographe vérifiable
 * en un seul endroit, et une traduction future ne toucherait qu'un fichier.
 * Chaque branche ajoute ses propres clés.
 */
export const fr = {
  app: {
    name: 'EventEase',
    tagline: 'Les événements de ton association, au même endroit.',
  },
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    loading: 'Chargement…',
  },
  theme: {
    toDark: 'Passer en mode sombre',
    toLight: 'Passer en mode clair',
  },
  // Écran de démonstration temporaire : remplacé par la connexion dans feat/auth.
  showcase: {
    title: 'Vitrine du thème',
    intro: 'Les composants de base avec la palette Prune & pêche. Cet écran sera remplacé par la connexion.',
    buttons: 'Boutons',
    primary: 'Je participe',
    outline: 'Ajouter à mon agenda',
    soft: 'Inscrit·e',
    danger: 'Supprimer',
    loading: 'Enregistrement',
    fields: 'Champs',
    emailLabel: 'E-mail',
    emailPlaceholder: 'prenom@exemple.fr',
    descriptionLabel: 'Description',
    errorExample: 'Ce champ est obligatoire.',
    card: 'Carte',
    cardTitle: 'Pique-nique de rentrée',
    cardBody: 'Samedi 24 octobre · Parc de la Tête d’Or',
    weatherSample: '18 °C · Ensoleillé',
    database: 'Base de données',
    dbCounts: (users: number, events: number, participations: number) =>
      `${users} utilisateurs · ${events} événements · ${participations} participations`,
    dbDemo: 'Compte démo : demo@eventease.fr / demo1234',
    dbError: 'La base de données est illisible.',
  },
};
