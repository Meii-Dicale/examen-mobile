/**
 * Logo EventEase (logo B de la maquette) : un ticket d'entrée avec une coche,
 * pour « j'ai participé ».
 *
 * C'est un SVG (react-native-svg) et pas une image PNG : il reste net à toutes les
 * tailles et prend les couleurs du thème (clair ou sombre). Le tracé est le même
 * que dans scripts/generate-icons.py, qui fabrique l'icône et le splash.
 */

import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/context/ThemeContext';

type Props = {
  /** Largeur en points. La hauteur suit (ticket de 80 × 60 : rapport 3/4). */
  size?: number;
  /** Couleur du ticket : prune du thème par défaut, blanc sur un fond prune (splash). */
  ticketColor?: string;
};

export function Logo({ size = 64, ticketColor }: Props) {
  const { colors } = useTheme();

  return (
    <Svg
      width={size}
      height={(size * 3) / 4}
      // Repère du SVG de la maquette (100 × 100), recadré sur le ticket (x 10→90, y 22→82) :
      // pas de marge invisible, le logo s'aligne avec le texte.
      viewBox="10 22 80 60"
      // Décoratif : le nom de l'app est écrit juste à côté, le lecteur d'écran le lit déjà.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Le ticket : rectangle aux coins arrondis, avec une encoche de chaque côté. */}
      <Path
        d="M20 22 H80 A10 10 0 0 1 90 32 V44 A8 8 0 0 0 90 60 V72 A10 10 0 0 1 80 82 H20 A10 10 0 0 1 10 72 V60 A8 8 0 0 0 10 44 V32 A10 10 0 0 1 20 22 Z"
        fill={ticketColor ?? colors.primary}
      />
      {/* La coche, couleur pêche. */}
      <Path
        d="M33 52 L45 64 L67 40"
        fill="none"
        stroke={colors.accent}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
