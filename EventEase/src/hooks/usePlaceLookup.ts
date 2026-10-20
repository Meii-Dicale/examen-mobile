/**
 * Recherche du lieu pendant la saisie du formulaire d'événement.
 *
 * Quand on quitte le champ « Lieu », on géocode le texte et on affiche ce que le
 * téléphone a compris (« Lieu reconnu : Lyon, France »). Si ce n'est pas le bon,
 * on corrige AVANT d'enregistrer. À l'envoi, `lookup` renvoie les coordonnées déjà
 * trouvées : pas de deuxième requête.
 *
 * La logique utilise une ref (pas un état) : l'envoi du formulaire peut arriver
 * juste après la sortie du champ, avant que React ait refait un rendu. La ref,
 * elle, est à jour immédiatement.
 */

import { useRef, useState } from 'react';

import { describePlace, geocodePlace } from '@/services/location';
import type { Coordinates } from '@/types/location';

export type PlaceStatus = 'idle' | 'searching' | 'found' | 'notFound';

type Found = { coords: Coordinates; label: string | null } | null;

async function search(query: string): Promise<Found> {
  const coords = await geocodePlace(query);
  if (!coords) return null;
  return { coords, label: await describePlace(coords) };
}

export function usePlaceLookup(initialName: string | null, initialCoords: Coordinates | null) {
  const initialQuery = initialName?.trim() ?? '';
  // Dernière recherche lancée. En modification, le lieu de départ a déjà ses coordonnées.
  const latest = useRef<{ query: string; result: Promise<Found> } | null>(null);
  // Ce que l'écran affiche sous le champ.
  const [display, setDisplay] = useState<{ query: string; status: PlaceStatus; label: string | null }>({
    query: initialQuery,
    status: 'idle',
    label: null,
  });

  /** Lance la recherche si le texte a changé, et renvoie les coordonnées (ou null). */
  const lookup = (name: string): Promise<Coordinates | null> => {
    const query = name.trim();
    latest.current ??= {
      query: initialQuery,
      result: Promise.resolve(initialCoords ? { coords: initialCoords, label: null } : null),
    };

    if (query !== latest.current.query) {
      const result = query ? search(query) : Promise.resolve(null);
      latest.current = { query, result };
      setDisplay({ query, status: query ? 'searching' : 'idle', label: null });
      result.then((found) => {
        // Le texte a encore changé entre-temps : cette réponse est périmée, on l'ignore.
        if (latest.current?.result !== result || !query) return;
        setDisplay({ query, status: found ? 'found' : 'notFound', label: found?.label ?? null });
      });
    }
    return latest.current.result.then((found) => found?.coords ?? null);
  };

  return { lookup, display };
}
