/** Prévision météo pour un créneau de 3 h (ce que l'app garde de la réponse OpenWeather). */
export type Weather = {
  /** Début du créneau prévu, en ISO (le plus proche de l'heure de l'événement). */
  time: string;
  /** Températures en °C (`units=metric`). */
  temperature: number;
  feelsLike: number;
  /** Description en français (`lang=fr`), ex. « nuageux ». */
  description: string;
  /** Code d'icône OpenWeather, ex. « 10d » (pluie, de jour). */
  icon: string;
  windKmh: number;
  /** Probabilité de pluie, de 0 à 100. */
  rainChance: number;
};
