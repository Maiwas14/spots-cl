import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores/authStore';
import { useColors } from '@/constants';

export default function Index() {
  const COLORS = useColors();
  const { session, loading } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    bootstrap();
  }, [loading, session]);

  const bootstrap = async () => {
    if (!session) {
      setChecking(false);
      router.replace('/(auth)/login');
      return;
    }

    if (!session.user.email_confirmed_at) {
      setChecking(false);
      router.replace('/(auth)/verificar');
      return;
    }

    const seen = await AsyncStorage.getItem('onboarding_seen');
    setChecking(false);
    if (!seen) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  );
}
