/**
 * Formatage des dates en français. Les dates sont stockées en ISO (UTC) ;
 * `toLocale…String` les affiche dans le fuseau horaire du téléphone.
 */

/** « samedi 24 octobre » */
export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** « 12:00 » */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/** « samedi 24 octobre · 12:00 » : la ligne de date des cartes et du détail. */
export function formatEventDate(iso: string): string {
  return `${formatDay(iso)} · ${formatTime(iso)}`;
}

/** true si la date est déjà passée. `now` est un paramètre pour pouvoir tester la fonction. */
export function isPast(iso: string, now: Date = new Date()): boolean {
  return new Date(iso).getTime() < now.getTime();
}

/** Date proposée par défaut à la création : demain à 18 h. */
export function defaultEventDate(now: Date = new Date()): string {
  const date = new Date(now);
  date.setDate(date.getDate() + 1);
  date.setHours(18, 0, 0, 0);
  return date.toISOString();
}
