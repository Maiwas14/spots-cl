import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/constants';
import type { Colors } from '@/constants';

export default function RecuperarScreen() {
  const COLORS = useColors();
  const styles = getStyles(COLORS);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresa tu correo');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'spots://',
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', 'No se pudo enviar el correo');
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.inner}>
          <Text style={styles.bigEmoji}>📬</Text>
          <Text style={styles.title}>Revisa tu correo</Text>
          <Text style={styles.subtitle}>
            Te enviamos un link para restablecer tu contraseña a{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.btnText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inner}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.title}>Recuperar contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo y te enviaremos un link para crear una nueva contraseña.
          </Text>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Correo</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              placeholderTextColor={COLORS.border}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSend} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Enviar link</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  kav: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 16, left: 28, padding: 4 },
  bigEmoji: { fontSize: 72, textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 12 },
  subtitle: { fontSize: 15, color: C.textMuted, lineHeight: 22, marginBottom: 36 },
  emailText: { color: C.text, fontWeight: '600' },
  inputWrap: { gap: 6, marginBottom: 28 },
  label: { fontSize: 12, fontWeight: '600', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    fontSize: 17, color: C.text,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: C.border,
  },
  btn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
