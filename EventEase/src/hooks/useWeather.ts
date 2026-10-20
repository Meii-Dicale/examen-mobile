/**
 * Météo de l'événement affiché, sur le modèle du Pokédex : fetch dans un service,
 * annulation avec AbortController quand l'écran est quitté.
 *
 * Statuts :
 * - `hidden` : rien à afficher (événement passé, lieu sans coordonnées, pas de clé) ;
 * - `tooFar` : plus de 5 jours avant, la prévision gratuite ne va pas si loin ;
 * - `loading`, `ready`, `unavailable` (créneau non couvert), `error` (réseau, clé).
 */

import { useEffect, useState } from 'react';

import { fetchForecast, forecastAvailability, isWeatherConfigured } from '@/services/weather';
import type { Event } from '@/types/event';
import type { Weather } from '@/types/weather';

export type WeatherStatus = 'hidden' | 'tooFar' | 'loading' | 'ready' | 'unavailable' | 'error';

type Result = { key: string; weather: Weather | null; failed: boolean };

export function useWeather(event: Event | null): { status: WeatherStatus; weather: Weather | null } {
  const [result, setResult] = useState<Result | null>(null);

  const latitude = event?.latitude ?? null;
  const longitude = event?.longitude ?? null;
  const date = event?.date ?? null;
  const availability = date ? forecastAvailability(date) : 'past';
  const canFetch = isWeatherConfigured() && latitude != null && longitude != null && availability === 'available';
  // La requête dépend du lieu et de l'heure : si l'un change (modification), on recharge.
  const key = `${latitude},${longitude},${date}`;

  useEffect(() => {
    if (!canFetch || latitude == null || longitude == null || date == null) return;
    // Copies locales : TypeScript sait qu'elles ne sont plus null dans `load`.
    const coords = { latitude, longitude };
    const target = date;
    const controller = new AbortController();

    // Fonction async déclarée DANS l'effet (règle du React Compiler, comme dans le Pokédex).
    async function load() {
      try {
        const weather = await fetchForecast(coords, target, controller.signal);
        setResult({ key, weather, failed: false });
      } catch {
        // Requête annulée volontairement : l'écran est déjà quitté, on n'écrit rien.
        if (!controller.signal.aborted) setResult({ key, weather: null, failed: true });
      }
    }

    load();
    return () => controller.abort();
  }, [canFetch, latitude, longitude, date, key]);

  if (availability === 'tooFar' && isWeatherConfigured() && latitude != null) return { status: 'tooFar', weather: null };
  if (!canFetch) return { status: 'hidden', weather: null };
  // Pas encore de résultat pour CETTE requête (premier chargement, ou lieu modifié).
  if (result?.key !== key) return { status: 'loading', weather: null };
  if (result.failed) return { status: 'error', weather: null };
  return result.weather ? { status: 'ready', weather: result.weather } : { status: 'unavailable', weather: null };
}
