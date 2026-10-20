/**
 * Fichiers des photos : choix (expo-image-picker) et copie dans le dossier de l'app
 * (expo-file-system). Aucun SQL ici : la base est gérée par services/photos.ts.
 *
 * Pourquoi copier ? Le sélecteur renvoie un fichier TEMPORAIRE (cache), que le système
 * peut effacer à tout moment. On le copie dans le dossier « document » de l'app, qui
 * n'est jamais vidé par le système. Il n'est supprimé qu'avec l'app.
 */

import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

/** Sous-dossier des photos, dans le dossier document de l'app. */
const PHOTOS_FOLDER = 'photos';

/** L'utilisateur a refusé l'accès à l'appareil photo. */
export class CameraPermissionError extends Error {
  constructor() {
    super('camera-permission-denied');
    this.name = 'CameraPermissionError';
  }
}

export type PhotoSource = 'camera' | 'library';

/**
 * Ouvre l'appareil photo ou la galerie. Renvoie l'adresse du fichier temporaire,
 * ou null si l'utilisateur a annulé.
 */
export async function pickPhoto(source: PhotoSource): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    // Compression JPEG à 70 % : une photo de téléphone passe de ~4 Mo à ~500 Ko.
    quality: 0.7,
  };

  let result: ImagePicker.ImagePickerResult;
  if (source === 'camera') {
    // L'appareil photo exige une permission. La galerie, non : le sélecteur du système
    // ne donne à l'app que la photo choisie, pas l'accès à toute la photothèque.
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) throw new CameraPermissionError();
    result = await ImagePicker.launchCameraAsync(options);
  } else {
    result = await ImagePicker.launchImageLibraryAsync(options);
  }

  return result.canceled ? null : (result.assets[0]?.uri ?? null);
}

/**
 * Copie le fichier temporaire dans le dossier de l'app et renvoie son chemin RELATIF
 * (« photos/1b9d….jpg »), qui sera enregistré en base.
 *
 * Pourquoi relatif ? Sur iOS, le chemin absolu du dossier de l'app change à chaque
 * mise à jour (il contient un identifiant). Un chemin absolu enregistré en base
 * deviendrait faux ; le chemin relatif, lui, est toujours valable.
 */
export async function savePhotoFile(tempUri: string): Promise<string> {
  const folder = new Directory(Paths.document, PHOTOS_FOLDER);
  // idempotent : ne fait rien si le dossier existe déjà.
  folder.create({ intermediates: true, idempotent: true });
  // Nom unique (UUID) : deux photos ne peuvent pas s'écraser.
  const name = `${Crypto.randomUUID()}${Paths.extname(tempUri) || '.jpg'}`;
  await new File(tempUri).copy(new File(folder, name));
  return `${PHOTOS_FOLDER}/${name}`;
}

/** Chemin relatif (base) → adresse complète du fichier, pour l'afficher. */
export function photoUri(relativePath: string): string {
  return new File(Paths.document, relativePath).uri;
}

/**
 * Supprime le fichier. Une erreur est ignorée : si le fichier n'existe déjà plus,
 * le résultat voulu (plus de fichier) est atteint.
 */
export function deletePhotoFile(relativePath: string): void {
  try {
    const file = new File(Paths.document, relativePath);
    if (file.exists) file.delete();
  } catch {
    // Rien à faire : au pire, un fichier orphelin reste dans le dossier de l'app.
  }
}
