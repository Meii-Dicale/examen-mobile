/**
 * Météo prévue pour un événement, avec l'API OpenWeather « 5 day / 3 hour forecast ».
 *
 * - Le plan gratuit donne une prévision par créneau de 3 h, sur 5 jours. Au-delà,
 *   ou pour un événement passé, il n'y a donc rien à afficher.
 * - On garde le créneau le plus proche de l'heure de l'événement.
 *
 * La clé est lue dans `.env` (EXPO_PUBLIC_OPENWEATHER_KEY), un fichier jamais versionné.
 * ⚠️ Une variable EXPO_PUBLIC_ est intégrée au code de l'app : quelqu'un de motivé
 * pourrait la retrouver. Pour une vraie app, l'appel passerait par un serveur qui garde
 * la clé secrète. Pour un prototype avec une clé gratuite, c'est un risque accepté.
 */

import type { Coordinates } from '@/types/location';
import type { Weather } from '@/types/weather';

const API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
// Remplacée par sa valeur au moment de construire l'app (Metro lit le fichier .env).
const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_KEY;

const HOUR_MS = 60 * 60 * 1000;
/** Durée couverte par la prévision gratuite. */
export const FORECAST_DAYS = 5;
/** Écart des créneaux de prévision. */
const SLOT_MS = 3 * HOUR_MS;

/** L'appel a échoué (pas de réseau, clé refusée, serveur indisponible). */
export class WeatherError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherError';
  }
}

/** La partie de la réponse JSON dont on se sert (le reste est ignoré). */
type ForecastSlot = {
  /** Début du créneau, en secondes depuis 1970 (timestamp Unix). */
  dt: number;
  main: { temp: number; feels_like: number };
  weather: { description: string; icon: string }[];
  /** Vent en m/s avec `units=metric`. */
  wind: { speed: number };
  /** Probabilité de précipitations, de 0 à 1. */
  pop?: number;
};
type ForecastResponse = { list: ForecastSlot[] };

/** true si la clé est renseignée dans `.env`. Sinon, la météo est simplement masquée. */
export function isWeatherConfigured(): boolean {
  return Boolean(API_KEY);
}

/**
 * Peut-on avoir une prévision pour cette date ? Fonction pure (`now` en paramètre)
 * pour pouvoir la tester. Elle évite un appel réseau qui ne servirait à rien.
 */
export function forecastAvailability(iso: string, now: Date = new Date()): 'past' | 'tooFar' | 'available' {
  const delta = new Date(iso).getTime() - now.getTime();
  if (delta < 0) return 'past';
  if (delta > FORECAST_DAYS * 24 * HOUR_MS) return 'tooFar';
  return 'available';
}

/**
 * Le créneau le plus proche de `targetMs`, ou null s'il est à plus de 3 h :
 * l'événement est alors en dehors de la période couverte par la prévision.
 */
export function pickClosestSlot<T extends { dt: number }>(slots: T[], targetMs: number): T | null {
  let best: T | null = null;
  for (const slot of slots) {
    if (!best || Math.abs(slot.dt * 1000 - targetMs) < Math.abs(best.dt * 1000 - targetMs)) best = slot;
  }
  return best && Math.abs(best.dt * 1000 - targetMs) <= SLOT_MS ? best : null;
}

/**
 * Prévision pour le lieu et l'heure donnés, ou null si l'heure n'est pas couverte.
 * `signal` (AbortController) : annule la requête si l'écran est quitté avant la réponse.
 */
export async function fetchForecast(coords: Coordinates, iso: string, signal?: AbortSignal): Promise<Weather | null> {
  if (!API_KEY) return null;
  // URLSearchParams encode correctement chaque paramètre.
  const params = new URLSearchParams({
    lat: String(coords.latitude),
    lon: String(coords.longitude),
    units: 'metric',
    lang: 'fr',
    appid: API_KEY,
  });

  const response = await fetch(`${API_URL}?${params}`, { signal });
  // fetch ne lève pas d'erreur pour un code HTTP 401 ou 500 : il faut vérifier `ok`.
  if (!response.ok) throw new WeatherError(`HTTP ${response.status}`);
  const data = (await response.json()) as ForecastResponse;

  const slot = pickClosestSlot(data.list, new Date(iso).getTime());
  if (!slot) return null;
  return {
    time: new Date(slot.dt * 1000).toISOString(),
    temperature: slot.main.temp,
    feelsLike: slot.main.feels_like,
    description: slot.weather[0]?.description ?? '',
    icon: slot.weather[0]?.icon ?? '',
    // m/s → km/h : × 3,6 (3 600 s dans une heure, 1 000 m dans un km).
    windKmh: Math.round(slot.wind.speed * 3.6),
    rainChance: Math.round((slot.pop ?? 0) * 100),
  };
}
