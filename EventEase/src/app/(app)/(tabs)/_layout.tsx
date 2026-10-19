import { Tabs } from 'expo-router';

import { TabIcon } from '@/components/common/TabIcon';
import { useTheme } from '@/context/ThemeContext';
import { fr } from '@/i18n/fr';
import { fonts } from '@/theme/tokens';

/** Barre d'onglets en bas : Événements, Calendrier, Profil. */
export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.semiBold, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: fr.tabs.events,
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="list" color={color} size={size} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: fr.tabs.calendar,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="calendar" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: fr.tabs.profile,
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="user" color={color} size={size} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
