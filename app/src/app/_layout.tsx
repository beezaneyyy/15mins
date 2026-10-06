import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

function RootStack() {
  const { c, dark, ready, settings } = useTheme();
  if (!ready) return null;
  const base = dark ? DarkTheme : DefaultTheme;
  return (
    <NavThemeProvider
      value={{ ...base, colors: { ...base.colors, background: c.bg, card: c.surface, primary: c.primary, text: c.text, border: c.border } }}
    >
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.bg },
          animation: settings.reduceMotion ? 'none' : 'default',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course/[id]/congrats" options={{ animation: settings.reduceMotion ? 'none' : 'fade', gestureEnabled: false }} />
      </Stack>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
