/** Événement tel que l'app le manipule (camelCase), avec le nom de son créateur. */
export type Event = {
  id: number;
  title: string;
  description: string;
  /** Date et heure au format ISO 8601 (UTC), ex. « 2026-10-24T10:00:00.000Z ». */
  date: string;
  locationName: string | null;
  /** Calculées par géocodage (feat/location) ; null si le lieu est inconnu. */
  latitude: number | null;
  longitude: number | null;
  createdBy: number;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
};

/** Ce que remplit le formulaire de création / modification. */
export type EventInput = {
  title: string;
  description: string;
  date: string;
  locationName: string | null;
};
