/** Photo d'un événement, ajoutée par une personne qui y a participé. */
export type EventPhoto = {
  id: number;
  eventId: number;
  userId: number;
  /** Prénom et nom de l'auteur·rice, pour l'accessibilité et l'appui long. */
  authorName: string;
  /** Adresse complète du fichier sur le téléphone, prête pour <Image source={{ uri }}>. */
  uri: string;
  createdAt: string;
};
