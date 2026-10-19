/**
 * Les « design tokens » : espacements, arrondis, polices et tailles de texte.
 * Les écrans n'écrivent jamais de valeurs en dur (16, 'Montserrat_700Bold'…),
 * ils passent par ces constantes : un seul endroit à modifier pour tout l'app.
 */

import type { TextStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  /** Badges et puces : complètement arrondis. */
  pill: 999,
} as const;

/**
 * Taille minimale d'une zone tactile (recommandation d'accessibilité : 44 à 48 px).
 */
export const touchTarget = 48;

/**
 * Noms des polices chargées avec `useFonts` dans `src/app/_layout.tsx`.
 * Avec une police personnalisée, `fontWeight` ne fonctionne pas sur Android :
 * chaque graisse est un fichier séparé, donc une `fontFamily` différente.
 */
export const fonts = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semiBold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  extraBold: 'Montserrat_800ExtraBold',
} as const;

/** Styles de texte réutilisables, repris de la maquette. */
export const typography = {
  /** Titre d'écran (« Événements », « Profil »). */
  title: { fontFamily: fonts.extraBold, fontSize: 26, lineHeight: 32 },
  /** Titre d'une carte ou d'une section de détail. */
  heading: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21 },
  /** Libellé de champ, texte de bouton. */
  label: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18 },
  /** Petit texte : badges, métadonnées. */
  caption: { fontFamily: fonts.semiBold, fontSize: 12, lineHeight: 16 },
  /** Intitulé de section en majuscules (« À venir », « Mes participations »). */
  section: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TextStyle>;
