/**
 * Splash animé, affiché par-dessus l'app au démarrage (même principe que le Pokédex).
 *
 * Le splash NATIF (app.json) est une image fixe, montrée avant que le JavaScript démarre ;
 * Expo Go le remplace par le sien. Ce composant, lui, est du React : il marche partout.
 * Il prend le relais avec la même couleur de fond, donc on ne voit pas la transition :
 * le ticket apparaît, le nom et le slogan suivent, puis tout s'efface.
 */

import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import { radius, spacing, typography } from '@/theme/tokens';

import { Logo } from './Logo';

const LOGO_SIZE = 96;
/** Barre de chargement de la maquette : 64 × 4, avec un segment de 40 % qui défile. */
const LOADER_WIDTH = 64;
const LOADER_SEGMENT = LOADER_WIDTH * 0.4;
const LIGHT_TRACK = 'rgba(255, 255, 255, 0.25)';
const TEXT_DELAY = 250;
/** Durée totale d'affichage avant de s'effacer : assez pour voir le logo, sans faire attendre. */
const VISIBLE_DURATION = 1600;
const FADE_DURATION = 350;

type Props = {
  /** Appelé à la fin de l'animation, pour retirer le splash. */
  onFinish: () => void;
};

export function AnimatedSplash({ onFinish }: Props) {
  const { colors, isDark } = useTheme();
  // Réglage « Réduire les animations » du téléphone : on affiche sans mouvement.
  const reduceMotion = useReducedMotion();

  const logoScale = useSharedValue(reduceMotion ? 1 : 0.6);
  const logoOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const textOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const loaderX = useSharedValue(-LOADER_SEGMENT);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!reduceMotion) {
      // Le ticket « saute » à sa taille (ressort), comme un tampon de validation.
      logoScale.value = withSpring(1, { damping: 12, stiffness: 140 });
      logoOpacity.value = withTiming(1, { duration: 250 });
      textOpacity.value = withDelay(TEXT_DELAY, withTiming(1, { duration: 400 }));
      // Barre de chargement : le segment traverse la barre en boucle (-1 = infini).
      loaderX.value = withRepeat(
        withTiming(LOADER_WIDTH, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        -1,
      );
    }
    opacity.value = withDelay(
      VISIBLE_DURATION,
      withTiming(0, { duration: FADE_DURATION }, (finished) => {
        // Le callback tourne sur le thread de l'animation : scheduleOnRN revient au thread JS.
        if (finished) scheduleOnRN(onFinish);
      }),
    );
  }, [reduceMotion, logoScale, logoOpacity, textOpacity, loaderX, opacity, onFinish]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const loaderStyle = useAnimatedStyle(() => ({ transform: [{ translateX: loaderX.value }] }));

  // Mêmes couleurs que le splash natif (app.json) : fond prune en clair, très sombre en sombre.
  const background = isDark ? colors.bg : colors.primary;
  const foreground = isDark ? colors.text : colors.onPrimary;
  // Rail de la barre de chargement : blanc transparent sur le prune (maquette), bordure en sombre.
  const loaderTrack = isDark ? colors.border : LIGHT_TRACK;

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: background }, containerStyle]}
      accessible
      accessibilityLabel={fr.app.loading}
    >
      <Animated.View style={logoStyle}>
        {/* En clair, ticket blanc sur fond prune ; en sombre, ticket prune clair (couleurs du thème). */}
        <Logo size={LOGO_SIZE} ticketColor={isDark ? colors.primary : colors.onPrimary} />
      </Animated.View>
      <Animated.View style={[styles.texts, textStyle]}>
        <Text style={[typography.title, styles.wordmark, { color: foreground }]}>{fr.app.name}</Text>
        <Text style={[typography.caption, styles.tagline, { color: foreground }]}>{fr.app.tagline}</Text>
      </Animated.View>
      {reduceMotion ? null : (
        <View style={[styles.loader, { backgroundColor: loaderTrack }]}>
          <Animated.View style={[styles.segment, { backgroundColor: colors.accent }, loaderStyle]} />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  texts: { alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xl },
  // Nom de l'app un peu plus grand que les titres d'écran (28 dans la maquette).
  wordmark: { fontSize: 28, lineHeight: 34 },
  tagline: { textAlign: 'center', opacity: 0.85 },
  loader: {
    width: LOADER_WIDTH,
    height: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  segment: { width: LOADER_SEGMENT, height: '100%', borderRadius: radius.pill },
});
