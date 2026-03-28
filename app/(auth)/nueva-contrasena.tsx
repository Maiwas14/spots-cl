import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/constants';
import type { Colors } from '@/constants';

export default function NuevaContrasenaScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      Alert.alert('Error', 'No se pudo actualizar la contraseña');
    } else {
      Alert.alert('¡Listo!', 'Tu contraseña fue actualizada', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inner}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nueva contraseña</Text>
          <Text style={styles.subtitle}>Elige una contraseña segura para tu cuenta.</Text>

          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={COLORS.border}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoFocus
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                placeholderTextColor={COLORS.border}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Guardar contraseña</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  kav: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 12 },
  subtitle: { fontSize: 15, color: C.textMuted, lineHeight: 22, marginBottom: 36 },
  form: { gap: 24 },
  inputWrap: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    fontSize: 17, color: C.text,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: C.border,
  },
  btn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cancelBtn: { alignSelf: 'flex-start', marginBottom: 24 },
  cancelText: { fontSize: 16, color: C.textMuted },
});
