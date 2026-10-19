import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, touchTarget, typography } from '@/theme/tokens';

/**
 * - primary : action principale (Se connecter, Enregistrer)
 * - outline : action secondaire (Ajouter à mon agenda)
 * - soft    : état actif (« Je participe » une fois cliqué)
 * - danger  : suppression
 */
type Variant = 'primary' | 'outline' | 'soft' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  /** Nom d'une icône Feather, affichée avant le texte. */
  icon?: ComponentProps<typeof Feather>['name'];
  disabled?: boolean;
  /** Affiche une roue de chargement à la place du texte (pendant un enregistrement). */
  loading?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  accessibilityHint,
  style,
}: Props) {
  const { colors } = useTheme();

  // Fond, bordure et couleur du texte de chaque variante, d'après la maquette.
  const variants: Record<Variant, { container: ViewStyle; text: string }> = {
    primary: { container: { backgroundColor: colors.primary }, text: colors.onPrimary },
    outline: { container: { borderWidth: 1.5, borderColor: colors.primary }, text: colors.primary },
    soft: { container: { backgroundColor: colors.primarySoft }, text: colors.primary },
    danger: { container: { borderWidth: 1.5, borderColor: colors.border }, text: colors.danger },
  };
  const v = variants[variant];
  // Pendant le chargement, on bloque aussi le bouton pour éviter un double envoi.
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      // Infos lues par VoiceOver / TalkBack.
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      // `pressed` permet un retour visuel quand le doigt appuie.
      style={({ pressed }) => [
        styles.base,
        v.container,
        { opacity: inactive ? 0.5 : pressed ? 0.75 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={18} color={v.text} /> : null}
          <Text style={[styles.label, { color: v.text }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: { ...typography.label, fontSize: 15 },
});
