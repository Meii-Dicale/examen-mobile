/**
 * Palette « Prune & pêche », validée dans docs/maquette-design.html.
 *
 * Tous les couples texte / fond respectent les contrastes WCAG niveau AA :
 * 4.5:1 pour le texte, 3:1 pour les éléments d'interface.
 * Règle à retenir : `accent` (pêche) sert uniquement de FOND (bouton +, carte météo).
 * Pour écrire en orange, on utilise `accentInk`, plus foncé, donc lisible.
 */

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  /** Fond des écrans. */
  bg: string;
  /** Cartes, champs de saisie, barre d'onglets. */
  surface: string;
  text: string;
  /** Texte secondaire : descriptions, libellés, dates. */
  muted: string;
  border: string;
  /** Couleur principale (prune) : boutons, liens, onglet actif. */
  primary: string;
  /** Fond doux prune : badge « Je participe », pastille de date. */
  primarySoft: string;
  /** Texte posé sur `primary`. */
  onPrimary: string;
  /** Pêche : fond du bouton + flottant et de la météo. */
  accent: string;
  accentSoft: string;
  /** Pêche foncée, pour écrire ou dessiner en orange. */
  accentInk: string;
  /** Texte posé sur `accent`. */
  onAccent: string;
  /** Suppression, erreurs de formulaire. */
  danger: string;
};

export const palettes: Record<ColorScheme, ThemeColors> = {
  light: {
    bg: '#F8F4F7',
    surface: '#FFFFFF',
    text: '#2A1730',
    muted: '#62506A',
    border: '#E8DDE6',
    primary: '#7A2E8E',
    primarySoft: '#F3E3F6',
    onPrimary: '#FFFFFF',
    accent: '#FF9466',
    accentSoft: '#FFE9DF',
    accentInk: '#9A3A10',
    onAccent: '#2A1730',
    danger: '#B42318',
  },
  dark: {
    bg: '#1A1020',
    surface: '#26182E',
    text: '#F6EEF7',
    muted: '#BBA8C2',
    border: '#3B2845',
    primary: '#D99BEA',
    primarySoft: '#3E2149',
    onPrimary: '#1A1020',
    accent: '#FFA680',
    accentSoft: '#41241A',
    accentInk: '#FFC2A8',
    onAccent: '#2A1730',
    danger: '#F07A6E',
  },
};
