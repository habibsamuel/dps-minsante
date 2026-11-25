import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TriageProvider } from '@/store';
import { colors, font } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TriageProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.sand },
            headerShadowVisible: false,
            headerTintColor: colors.ink,
            headerTitleStyle: { ...font.h3, color: colors.ink },
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: { backgroundColor: colors.sand },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="triage" options={{ title: 'Évaluation' }} />
          <Stack.Screen name="resultat" options={{ title: 'Résultat' }} />
          <Stack.Screen name="medecins" options={{ title: 'Médecins' }} />
          <Stack.Screen name="consultation/[id]" options={{ title: 'Consultation' }} />
          <Stack.Screen name="auth" options={{ title: 'Mon compte' }} />
          <Stack.Screen name="profil" options={{ title: 'Profil' }} />
          <Stack.Screen name="historique" options={{ title: 'Mes demandes' }} />
          <Stack.Screen name="espace-medecin" options={{ title: 'Espace médecin' }} />
        </Stack>
      </TriageProvider>
    </SafeAreaProvider>
  );
}
