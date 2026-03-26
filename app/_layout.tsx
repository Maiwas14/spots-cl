import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout() {
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/(auth)/nueva-contrasena');
        return;
      }
      if (!session) {
        router.replace('/(auth)/login');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="lugar/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="perfil/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="editar-perfil" options={{ presentation: 'modal' }} />
        <Stack.Screen name="editar-lugar/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
