import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useColors } from '@/constants';
import type { Colors } from '@/constants';

export default function VerificarScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

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

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 72, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: C.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  email: { color: C.text, fontWeight: '600' },
  hint: { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 40 },
  primaryBtn: {
    backgroundColor: C.primary, borderRadius: 14,
    paddingVertical: 15, paddingHorizontal: 32,
    alignItems: 'center', width: '100%', marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    borderRadius: 14, paddingVertical: 15, paddingHorizontal: 32,
    alignItems: 'center', width: '100%', backgroundColor: C.surface,
  },
  secondaryBtnText: { color: C.primary, fontSize: 15, fontWeight: '600' },
  logoutBtn: { marginTop: 24 },
  logoutText: { fontSize: 14, color: C.textMuted },
});
