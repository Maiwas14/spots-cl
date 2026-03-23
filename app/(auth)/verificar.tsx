import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { COLORS } from '@/constants';

export default function VerificarScreen() {
  const { user, signOut } = useAuthStore();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleResend = async () => {
    if (!user?.email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
    setResending(false);
    if (error) {
      Alert.alert('Error', 'No se pudo reenviar el correo');
    } else {
      Alert.alert('Enviado', 'Revisa tu bandeja de entrada');
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    const { data } = await supabase.auth.getSession();
    setChecking(false);
    if (data.session?.user.email_confirmed_at) {
      router.replace('/');
    } else {
      Alert.alert('Aún no confirmado', 'Revisa tu correo y vuelve a intentarlo');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>📬</Text>
        <Text style={styles.title}>Confirma tu correo</Text>
        <Text style={styles.subtitle}>
          Te enviamos un link de confirmación a{'\n'}
          <Text style={styles.email}>{user?.email}</Text>
        </Text>
        <Text style={styles.hint}>
          Abre el correo y toca el link para activar tu cuenta.
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleCheck} disabled={checking}>
          {checking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Ya confirmé, continuar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleResend} disabled={resending}>
          {resending ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.secondaryBtnText}>Reenviar correo</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Usar otra cuenta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 72, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  email: { color: COLORS.text, fontWeight: '600' },
  hint: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 40 },
  primaryBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 15, paddingHorizontal: 32,
    alignItems: 'center', width: '100%', marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    borderRadius: 14, paddingVertical: 15, paddingHorizontal: 32,
    alignItems: 'center', width: '100%', backgroundColor: COLORS.surface,
  },
  secondaryBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  logoutBtn: { marginTop: 24 },
  logoutText: { fontSize: 14, color: COLORS.textMuted },
});
