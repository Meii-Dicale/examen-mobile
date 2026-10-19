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
  auth: {
    loginTitle: 'Connexion',
    loginSubtitle: 'Retrouve les événements de ton association.',
    registerTitle: 'Créer un compte',
    registerSubtitle: 'Quelques secondes et tu peux participer.',
    name: 'Prénom et nom',
    namePlaceholder: 'Alex Martin',
    email: 'E-mail',
    emailPlaceholder: 'prenom@exemple.fr',
    password: 'Mot de passe',
    passwordPlaceholder: '8 caractères minimum',
    confirm: 'Confirmation du mot de passe',
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    noAccount: 'Pas encore de compte ?',
    toRegister: 'Créer un compte',
    hasAccount: 'Déjà un compte ?',
    toLogin: 'Se connecter',
    demoHint: 'Compte démo : demo@eventease.fr / demo1234',
    errorEmail: 'Saisis une adresse e-mail valide.',
    errorPasswordRequired: 'Saisis ton mot de passe.',
    errorPasswordLength: 'Le mot de passe doit faire au moins 8 caractères.',
    errorConfirm: 'Les deux mots de passe ne correspondent pas.',
    errorNameRequired: 'Saisis ton nom.',
    errorInvalidCredentials: 'E-mail ou mot de passe incorrect.',
    errorEmailTaken: 'Un compte existe déjà avec cet e-mail.',
    errorUnknown: 'Une erreur est survenue, réessaie.',
  },
  tabs: {
    events: 'Événements',
    calendar: 'Calendrier',
    profile: 'Profil',
  },
  events: {
    title: 'Événements',
    comingSoon: 'La liste des événements arrive dans la prochaine étape.',
  },
  calendar: {
    title: 'Calendrier',
    comingSoon: 'Le calendrier arrive dans une prochaine étape.',
  },
  profile: {
    title: 'Profil',
    memberSince: (date: string) => `Membre depuis le ${date}`,
    appearance: 'Apparence',
    account: 'Compte',
    signOut: 'Se déconnecter',
  },
};
