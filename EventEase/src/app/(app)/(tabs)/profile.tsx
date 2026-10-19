/**
 * Onglet Profil : infos du compte, mes participations, choix du thème et déconnexion.
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LoadState } from '@/components/common/LoadState';
import { EventCard } from '@/components/events/EventCard';
import { Button, Card, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useMyParticipations } from '@/hooks/useEvents';
import { fr } from '@/i18n/fr';
import { radius, spacing, typography } from '@/theme/tokens';
import { isPast } from '@/utils/date';

const t = fr.profile;

/** Initiales pour l'avatar : « Alex Martin » → « AM ». */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function ProfileTab() {
  const { colors, isDark, toggleScheme } = useTheme();
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  // Les hooks sont appelés AVANT le `return null` ci-dessous : React exige qu'ils
  // soient appelés dans le même ordre à chaque rendu.
  const participations = useMyParticipations();

  // Cet écran n'existe que si quelqu'un est connecté (Stack.Protected) ;
  // le test rassure TypeScript, pour qui `user` peut être null.
  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const events = participations.data ?? [];
  const upcomingCount = events.filter((event) => !isPast(event.date)).length;

  const handleSignOut = async () => {
    setSigningOut(true);
    // Après signOut, `user` passe à null : Stack.Protected renvoie vers la connexion.
    await signOut();
  };

  return (
    <Screen scroll edges={['top', 'left', 'right']}>
      <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
        {t.title}
      </Text>

      <Card>
        <View style={styles.identity}>
          <View
            style={[styles.avatar, { backgroundColor: colors.primarySoft }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Text style={[typography.heading, { color: colors.primary }]}>{initials(user.name)}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={[typography.heading, { color: colors.text }]}>{user.name}</Text>
            <Text style={[typography.body, { color: colors.muted }]}>{user.email}</Text>
            <Text style={[typography.caption, { color: colors.muted }]}>{t.memberSince(memberSince)}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text accessibilityRole="header" style={[typography.section, { color: colors.muted }]}>
          {t.participations}
        </Text>
        {events.length > 0 ? (
          <Text style={[typography.caption, { color: colors.muted }]}>
            {t.stats(upcomingCount, events.length - upcomingCount)}
          </Text>
        ) : null}
      </View>
      <LoadState
        loading={participations.loading}
        error={participations.error}
        hasData={participations.data != null}
        onRetry={participations.reload}
        errorTitle={fr.events.loadError}
      >
        {events.length === 0 ? (
          <Text style={[typography.body, { color: colors.muted }]}>{t.participationsEmpty}</Text>
        ) : (
          // Liste courte : un simple .map() suffit ici (pas besoin de virtualisation).
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isMine={event.createdBy === user.id}
              onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(event.id) } })}
            />
          ))
        )}
      </LoadState>

      <Text style={[typography.section, { color: colors.muted }]}>{t.appearance}</Text>
      <Button
        variant="outline"
        icon={isDark ? 'sun' : 'moon'}
        label={isDark ? fr.theme.toLight : fr.theme.toDark}
        onPress={toggleScheme}
      />

      <Text style={[typography.section, { color: colors.muted }]}>{t.account}</Text>
      <Button variant="danger" icon="log-out" label={t.signOut} onPress={handleSignOut} loading={signingOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: { flex: 1, gap: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
});
