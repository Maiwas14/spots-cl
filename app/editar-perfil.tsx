import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUploadImage } from '@/hooks/useUploadImage';
import { Avatar } from '@/components/Avatar';
import { useColors } from '@/constants';
import type { Colors } from '@/constants';

export default function EditarPerfilScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

  const { user, profile, setProfile } = useAuthStore();
  const { uploadAvatar } = useUploadImage();
  const [username, setUsername] = useState(profile?.username ?? '');
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currentAvatar = avatarUri ?? profile?.avatar_url ?? null;

  const handlePickAvatar = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancelar', 'Galería', 'Tomar foto'], cancelButtonIndex: 0 },
        async (idx) => {
          if (idx === 1) await pickFromLibrary();
          if (idx === 2) await pickFromCamera();
        }
      );
    } else {
      pickFromLibrary();
    }
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!user) return;
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername) {
      Alert.alert('Error', 'El nombre de usuario no puede estar vacio');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
      Alert.alert('Error', 'El nombre de usuario solo puede contener letras minusculas, numeros y guiones bajos');
      return;
    }
    setSaving(true);

    // Check username uniqueness (only if changed)
    if (normalizedUsername !== profile?.username) {
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', normalizedUsername)
        .neq('id', user.id)
        .maybeSingle();
      if (checkError) {
        setSaving(false);
        Alert.alert('Error', 'No se pudo verificar el nombre de usuario');
        return;
      }
      if (existing) {
        setSaving(false);
        Alert.alert('Error', 'Este nombre de usuario ya esta en uso');
        return;
      }
    }

    let avatarUrl = profile?.avatar_url ?? null;
    if (avatarUri) {
      const uploaded = await uploadAvatar(avatarUri);
      if (uploaded) avatarUrl = uploaded;
    }

    const updates = {
      username: username.trim().toLowerCase(),
      full_name: fullName.trim(),
      bio: bio.trim(),
      avatar_url: avatarUrl,
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } else {
      if (data) setProfile(data);
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.navCancel}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Editar perfil</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.navSave}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.avatarSection} onPress={handlePickAvatar}>
          <Avatar uri={currentAvatar} username={profile?.username} size={96} />
          <Text style={styles.changePhotoText}>Cambiar foto</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Tu nombre"
            placeholderTextColor={COLORS.textMuted}
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Usuario</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="tunombre"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            maxLength={30}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Biografía</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Cuéntanos sobre ti..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            maxLength={150}
          />
          <Text style={styles.charCount}>{bio.length}/150</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  navCancel: { fontSize: 16, color: C.textMuted },
  navTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  navSave: { fontSize: 16, color: C.text, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  changePhotoText: { fontSize: 14, color: C.primary, fontWeight: '600', marginTop: 10 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: C.text,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  inputDisabled: { backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  inputDisabledText: { fontSize: 15, color: C.textMuted },
  hint: { fontSize: 12, color: C.textMuted, marginTop: 6 },
  charCount: { fontSize: 12, color: C.textMuted, textAlign: 'right', marginTop: 4 },
});
