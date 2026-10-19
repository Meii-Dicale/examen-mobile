/**
 * Écran TEMPORAIRE : vitrine des composants et du thème, pour vérifier sur Expo Go
 * que les couleurs, la police et le mode sombre fonctionnent.
 * Il sera remplacé par l'écran de connexion dans la branche feat/auth.
 */

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Input, Screen } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { useDatabaseSummary } from '@/hooks/useDatabaseSummary';
import { fr } from '@/i18n/fr';
import { radius, spacing, typography } from '@/theme/tokens';

const t = fr.showcase;

export default function Showcase() {
  const { colors, isDark, toggleScheme } = useTheme();
  const summary = useDatabaseSummary();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[typography.title, { color: colors.text }]}>{t.title}</Text>
        <Text style={[typography.body, { color: colors.muted }]}>{t.intro}</Text>
      </View>

      <Button
        variant="outline"
        icon={isDark ? 'sun' : 'moon'}
        label={isDark ? fr.theme.toLight : fr.theme.toDark}
        onPress={toggleScheme}
      />

      <Text style={[typography.section, { color: colors.muted }]}>{t.buttons}</Text>
      <Button label={t.primary} icon="check" />
      <Button variant="outline" label={t.outline} icon="calendar" />
      <Button variant="soft" label={t.soft} icon="check-circle" />
      <Button variant="danger" label={t.danger} icon="trash-2" />
      <Button label={t.loading} loading />

      <Text style={[typography.section, { color: colors.muted }]}>{t.fields}</Text>
      <Input
        label={t.emailLabel}
        placeholder={t.emailPlaceholder}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input label={t.descriptionLabel} multiline error={t.errorExample} />

      <Text style={[typography.section, { color: colors.muted }]}>{t.card}</Text>
      <Card>
        <Text style={[typography.heading, { color: colors.text }]}>{t.cardTitle}</Text>
        <Text style={[typography.body, { color: colors.muted }]}>{t.cardBody}</Text>
        {/* Bandeau pêche : accent en FOND, texte en onAccent (règle d'accessibilité). */}
        <View style={[styles.accent, { backgroundColor: colors.accent }]}>
          <Text style={[typography.label, { color: colors.onAccent }]}>{t.weatherSample}</Text>
        </View>
      </Card>

      <Text style={[typography.section, { color: colors.muted }]}>{t.database}</Text>
      <Card>
        {summary.loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : summary.error || !summary.data ? (
          <Text style={[typography.body, { color: colors.danger }]}>{t.dbError}</Text>
        ) : (
          <>
            <Text style={[typography.body, { color: colors.text }]}>
              {t.dbCounts(summary.data.users, summary.data.events, summary.data.participations)}
            </Text>
            <Text style={[typography.caption, { color: colors.muted }]}>{t.dbDemo}</Text>
          </>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
  accent: { borderRadius: radius.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
});
