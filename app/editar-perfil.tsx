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
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUploadImage } from '@/hooks/useUploadImage';
import { Avatar } from '@/components/Avatar';
import { COLORS } from '@/constants';

export default function EditarPerfilScreen() {
  const { user, profile, setProfile } = useAuthStore();
  const { uploadAvatar } = useUploadImage();
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
    setSaving(true);

    let avatarUrl = profile?.avatar_url ?? null;
    if (avatarUri) {
      const uploaded = await uploadAvatar(avatarUri);
      if (uploaded) avatarUrl = uploaded;
    }

    const updates = {
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
          <View style={styles.inputDisabled}>
            <Text style={styles.inputDisabledText}>@{profile?.username}</Text>
          </View>
          <Text style={styles.hint}>El nombre de usuario no se puede cambiar</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navCancel: { fontSize: 16, color: COLORS.textMuted },
  navTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  navSave: { fontSize: 16, color: COLORS.text, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  changePhotoText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  inputDisabled: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  inputDisabledText: { fontSize: 15, color: COLORS.textMuted },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  charCount: { fontSize: 12, color: COLORS.textMuted, textAlign: 'right', marginTop: 4 },
});
