import { Text, type TextProps } from 'react-native';

/**
 * Texte annoncé par le lecteur d'écran dès qu'il apparaît (erreur de formulaire).
 * « polite » : l'annonce attend la fin de ce que le lecteur est en train de dire.
 */
export function LiveText(props: TextProps) {
  return <Text accessibilityRole="alert" accessibilityLiveRegion="polite" {...props} />;
}
