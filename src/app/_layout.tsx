import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { darkPalette, lightPalette } from '@/constants/palette';
import { initDatabase } from '../database/db';

SplashScreen.preventAutoHideAsync();

const makeTheme = (dark: boolean) => {
  const base = dark ? DarkTheme : DefaultTheme;
  const p = dark ? darkPalette : lightPalette;
  return {
    ...base,
    colors: { ...base.colors, background: p.bg, card: p.card, text: p.text, border: p.border, primary: p.primary },
  };
};

export default function RootLayout() {
  const dark = useColorScheme() === 'dark';

  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <ThemeProvider value={makeTheme(dark)}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="resultado" options={{ presentation: 'card' }} />
        <Stack.Screen name="planta/[id]" />
      </Stack>
      <AnimatedSplashOverlay />
    </ThemeProvider>
  );
}
