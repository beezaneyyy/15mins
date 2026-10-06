import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { useTheme } from '@/theme/ThemeProvider';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName; active: IconName }[] = [
  { name: 'index', title: 'Início', icon: 'home-outline', active: 'home' },
  { name: 'explore', title: 'Explorar', icon: 'search-outline', active: 'search' },
  { name: 'my-courses', title: 'Meus cursos', icon: 'book-outline', active: 'book' },
  { name: 'certificates', title: 'Certificados', icon: 'ribbon-outline', active: 'ribbon' },
  { name: 'profile', title: 'Perfil', icon: 'person-outline', active: 'person' },
];

export default function TabLayout() {
  const { c, fs } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.subtle,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        tabBarLabelStyle: { fontSize: fs(11), fontWeight: '600' },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, focused, size }) => <Ionicons name={focused ? t.active : t.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
