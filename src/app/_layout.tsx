import {
  Comfortaa_400Regular,
  Comfortaa_500Medium,
  Comfortaa_600SemiBold,
  Comfortaa_700Bold,
  useFonts,
} from '@expo-google-fonts/comfortaa';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TriageProvider } from '@/store';
import { colors } from '@/theme';

// Empêche le splash screen de disparaître tant que les polices ne sont pas prêtes.
// Doit être appelé au niveau module, avant tout rendu.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Comfortaa_400Regular,
    Comfortaa_500Medium,
    Comfortaa_600SemiBold,
    Comfortaa_700Bold,
  });

  useEffect(() => {
    // On masque le splash dès que les polices sont prêtes (ou en cas d'erreur,
    // pour ne pas bloquer l'app indéfiniment).
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Rien n'est rendu tant que le splash est visible : évite un flash de texte
  // en police système avant que Comfortaa ne prenne le relais.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <TriageProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false, // le header est géré par Master
            contentStyle: { backgroundColor: colors.sand },
          }}
        />
      </TriageProvider>
    </SafeAreaProvider>
  );
}