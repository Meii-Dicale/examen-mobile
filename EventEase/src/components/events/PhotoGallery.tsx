/**
 * Galerie horizontale des photos d'un événement passé.
 * - Appui : la photo s'ouvre en plein écran.
 * - Appui long sur SA photo : suppression (la confirmation est gérée par l'écran).
 * Le composant n'appelle aucun service : il affiche et prévient l'écran (onAdd, onDelete).
 */

import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import { radius, spacing, touchTarget, typography } from '@/theme/tokens';
import type { EventPhoto } from '@/types/photo';

const t = fr.photos;

/** Côté d'une vignette, en points. */
const THUMB_SIZE = 120;

type Props = {
  photos: EventPhoto[];
  currentUserId: number | undefined;
  /** Vrai si l'utilisateur peut ajouter une photo (il a participé, l'événement est passé). */
  canAdd: boolean;
  adding: boolean;
  onAdd: () => void;
  onDelete: (photo: EventPhoto) => void;
};

export function PhotoGallery({ photos, currentUserId, canAdd, adding, onAdd, onDelete }: Props) {
  const { colors } = useTheme();
  // Photo ouverte en plein écran (null : aucune). Simple état d'affichage, pas de donnée.
  const [opened, setOpened] = useState<EventPhoto | null>(null);

  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[typography.section, { color: colors.muted }]}>
        {t.title}
      </Text>

      <FlatList
        horizontal
        data={photos}
        keyExtractor={(photo) => String(photo.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        // La tuile « + » est toujours la première, avant les photos.
        ListHeaderComponent={
          canAdd ? (
            <Pressable
              onPress={onAdd}
              disabled={adding}
              accessibilityRole="button"
              accessibilityLabel={t.add}
              accessibilityHint={t.addHint}
              accessibilityState={{ disabled: adding, busy: adding }}
              style={[styles.thumb, styles.addTile, { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}
            >
              {adding ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Feather name="camera" size={26} color={colors.primary} />
                  <Text style={[typography.caption, styles.center, { color: colors.primary }]}>{t.add}</Text>
                </>
              )}
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => {
          const mine = item.userId === currentUserId;
          return (
            <Pressable
              onPress={() => setOpened(item)}
              // Pas d'appui long sur la photo de quelqu'un d'autre.
              onLongPress={mine ? () => onDelete(item) : undefined}
              accessibilityRole="imagebutton"
              accessibilityLabel={mine ? t.mine : t.photoBy(item.authorName)}
              accessibilityHint={mine ? t.mineHint : t.openHint}
            >
              <Image
                source={item.uri}
                style={[styles.thumb, { backgroundColor: colors.border }]}
                contentFit="cover"
                transition={150}
              />
            </Pressable>
          );
        }}
      />

      {photos.length === 0 ? (
        <Text style={[typography.caption, { color: colors.muted }]}>{canAdd ? t.emptyCanAdd : t.empty}</Text>
      ) : null}

      <PhotoViewer photo={opened} onClose={() => setOpened(null)} />
    </View>
  );
}

type ViewerProps = { photo: EventPhoto | null; onClose: () => void };

/** Photo en plein écran, sur fond noir (quel que soit le thème, comme une visionneuse). */
function PhotoViewer({ photo, onClose }: ViewerProps) {
  // Marges du système (encoche, barre d'état) : le bouton Fermer reste atteignable.
  const insets = useSafeAreaInsets();

  return (
    // onRequestClose : bouton retour d'Android.
    <Modal visible={photo != null} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.viewer}>
        {photo ? (
          <>
            <Image
              source={photo.uri}
              style={styles.fill}
              contentFit="contain"
              accessibilityLabel={t.photoBy(photo.authorName)}
            />
            <Text style={[typography.caption, styles.author, { bottom: insets.bottom + spacing.lg }]}>
              {t.photoBy(photo.authorName)}
            </Text>
          </>
        ) : null}
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t.close}
          hitSlop={spacing.sm}
          style={[styles.close, { top: insets.top + spacing.sm }]}
        >
          <Feather name="x" size={28} color="#FFFFFF" />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  list: { gap: spacing.sm },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: radius.md },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: spacing.sm,
  },
  center: { textAlign: 'center' },
  viewer: { flex: 1, backgroundColor: '#000000' },
  fill: { flex: 1 },
  author: { position: 'absolute', left: spacing.lg, right: spacing.lg, color: '#FFFFFF', textAlign: 'center' },
  close: {
    position: 'absolute',
    right: spacing.md,
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
