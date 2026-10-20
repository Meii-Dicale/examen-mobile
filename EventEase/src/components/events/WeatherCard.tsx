import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import type { WeatherStatus } from '@/hooks/useWeather';
import { fr } from '@/i18n/fr';
import { fonts, radius, spacing, typography } from '@/theme/tokens';
import type { Weather } from '@/types/weather';
import { formatTime } from '@/utils/date';

const t = fr.weather;

type FeatherName = ComponentProps<typeof Feather>['name'];

/**
 * Icône Feather à partir du code OpenWeather (« 10d » : les 2 chiffres donnent le type
 * de temps, la lettre jour ou nuit). Pas d'image téléchargée : l'icône suit le thème.
 */
export function weatherIcon(code: string): FeatherName {
  const night = code.endsWith('n');
  switch (code.slice(0, 2)) {
    case '01':
      return night ? 'moon' : 'sun';
    case '09':
      return 'cloud-drizzle';
    case '10':
      return 'cloud-rain';
    case '11':
      return 'cloud-lightning';
    case '13':
      return 'cloud-snow';
    case '50':
      return 'wind'; // brume, brouillard
    default:
      return 'cloud'; // 02, 03, 04 : nuages
  }
}

type Props = { status: WeatherStatus; weather: Weather | null };

/**
 * Carte météo du détail (maquette : fond accentSoft, texte accentInk, contraste AA).
 * Rien n'est affiché si la météo n'a pas de sens (événement passé, lieu inconnu).
 */
export function WeatherCard({ status, weather }: Props) {
  const { colors } = useTheme();
  if (status === 'hidden') return null;

  const ink = { color: colors.accentInk };

  // États sans prévision : une seule ligne d'explication.
  if (status !== 'ready' || !weather) {
    const message =
      status === 'loading' ? t.loading : status === 'tooFar' ? t.tooFar : status === 'error' ? t.error : t.unavailable;
    return (
      <View
        style={[styles.card, { backgroundColor: colors.accentSoft }]}
        accessible
        accessibilityLabel={message}
        accessibilityLiveRegion="polite"
      >
        {status === 'loading' ? (
          <ActivityIndicator color={colors.accentInk} />
        ) : (
          <Feather name="cloud-off" size={22} color={colors.accentInk} />
        )}
        <Text style={[typography.caption, styles.flex, ink]}>{message}</Text>
      </View>
    );
  }

  const temperature = `${Math.round(weather.temperature)}°`;
  // La description OpenWeather est en minuscules (« nuageux ») : majuscule au début.
  const description = weather.description.charAt(0).toUpperCase() + weather.description.slice(1);
  const details = [
    description,
    t.wind(weather.windKmh),
    weather.rainChance > 0 ? t.rain(weather.rainChance) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View
      style={[styles.card, { backgroundColor: colors.accentSoft }]}
      // Une seule phrase pour le lecteur d'écran.
      accessible
      accessibilityLabel={`${t.forecastAt(formatTime(weather.time))}, ${Math.round(weather.temperature)} degrés, ${details}`}
    >
      <Feather name={weatherIcon(weather.icon)} size={26} color={colors.accentInk} />
      <View style={styles.flex}>
        <Text style={[typography.caption, ink]}>{t.forecastAt(formatTime(weather.time))}</Text>
        <Text style={[typography.caption, styles.details, ink]}>{details}</Text>
      </View>
      <Text style={[typography.title, ink]}>{temperature}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  flex: { flex: 1 },
  // Deuxième ligne moins appuyée, comme dans la maquette.
  details: { fontFamily: fonts.medium },
});
