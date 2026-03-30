import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
  Dimensions,
} from 'react-native';
import { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { usePostsStore } from '@/stores/postsStore';
import { useRegiones } from '@/hooks/useRegiones';
import { useComunas } from '@/hooks/useComunas';
import { useUploadImage } from '@/hooks/useUploadImage';
import { useColors, CATEGORIAS, DIFICULTADES } from '@/constants';
import type { Colors } from '@/constants';
import { CategoriaTipo } from '@/types';
import { DifficultyBar } from '@/components/DifficultyBar';

const { width } = Dimensions.get('window');
const THUMB = (width - 32 - 16) / 3;

export default function SubirScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

  const { user } = useAuthStore();
  const fetchPosts = usePostsStore((s) => s.fetchPosts);
  const { regiones } = useRegiones();
  const { pickMultipleImages, takePhoto, uploadImage, uploadMultipleImages, uploading } = useUploadImage();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [regionId, setRegionId] = useState<number | null>(null);
  const [comunaId, setComunaId] = useState<number | null>(null);
  const [categoria, setCategoria] = useState<CategoriaTipo>('naturaleza');
  const [dificultad, setDificultad] = useState(1);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const { comunas } = useComunas(regionId);

  const handlePickImages = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancelar', 'Galería (hasta 5)', 'Tomar foto'], cancelButtonIndex: 0 },
        async (idx) => {
          if (idx === 1) {
            const uris = await pickMultipleImages();
            if (uris.length > 0) setImageUris(uris);
          }
          if (idx === 2) {
            const uri = await takePhoto();
            if (uri) setImageUris((prev) => [...prev, uri].slice(0, 5));
          }
        }
      );
    } else {
      Alert.alert('Agregar fotos', 'Elige una opción', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galería', onPress: () => pickMultipleImages().then((uris) => uris.length > 0 && setImageUris(uris)) },
        { text: 'Tomar foto', onPress: async () => { const uri = await takePhoto(); if (uri) setImageUris((prev) => [...prev, uri].slice(0, 5)); } },
      ]);
    }
  };

  const removeImage = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetLocation = async () => {
    setLocLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sin permiso', 'Necesitamos acceso a tu ubicación');
      setLocLoading(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLat(loc.coords.latitude);
    setLng(loc.coords.longitude);
    setLocLoading(false);
  };

  const handleSubmit = async () => {
    if (!titulo || imageUris.length === 0 || !regionId) {
      Alert.alert('Faltan datos', 'Título, al menos una foto y región son obligatorios');
      return;
    }
    if (!user) return;

    setSaving(true);

    const mainUrl = await uploadImage(imageUris[0]);
    if (!mainUrl) {
      Alert.alert('Error', 'No se pudo subir la imagen');
      setSaving(false);
      return;
    }

    const { data: post, error } = await supabase.from('posts').insert({
      user_id: user.id,
      titulo,
      descripcion,
      imagen_url: mainUrl,
      lat,
      lng,
      region_id: regionId,
      comuna_id: comunaId,
      categoria,
      dificultad,
    }).select().single();

    if (error || !post) {
      Alert.alert('Error', 'No se pudo guardar el lugar');
      setSaving(false);
      return;
    }

    if (imageUris.length > 1) {
      const extraUrls = await uploadMultipleImages(imageUris.slice(1));
      if (extraUrls.length > 0) {
        await supabase.from('post_images').insert(
          extraUrls.map((url, i) => ({ post_id: post.id, url, orden: i + 1 }))
        );
      }
    }

    await supabase.from('post_images').insert({ post_id: post.id, url: mainUrl, orden: 0 });

    setSaving(false);
    await fetchPosts(true);
    Alert.alert('¡Publicado!', 'Tu spot ya está visible', [
      { text: 'Ver feed', onPress: () => router.replace('/(tabs)') },
    ]);
    setTitulo(''); setDescripcion(''); setImageUris([]);
    setRegionId(null); setComunaId(null); setLat(null); setLng(null); setDificultad(1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Nuevo spot</Text>

        {imageUris.length === 0 ? (
          <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickImages}>
            <Ionicons name="camera-outline" size={36} color={COLORS.textMuted} />
            <Text style={styles.imagePlaceholderText}>Elige hasta 5 fotos</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.thumbGrid}>
            {imageUris.map((uri, i) => (
              <View key={i} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} />
                {i === 0 && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>Principal</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
                  <Ionicons name="close-circle" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {imageUris.length < 5 && (
              <TouchableOpacity style={styles.addMoreBtn} onPress={handlePickImages}>
                <Ionicons name="add" size={28} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder="¿Cómo se llama este lugar?"
          placeholderTextColor={COLORS.textMuted}
          value={titulo}
          onChangeText={setTitulo}
          maxLength={80}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Cuéntanos sobre este spot..."
          placeholderTextColor={COLORS.textMuted}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={3}
          maxLength={300}
        />

        <Text style={styles.label}>Región *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
          {regiones.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.chip, regionId === r.id && styles.chipActive]}
              onPress={() => { setRegionId(r.id); setComunaId(null); }}
            >
              <Text style={[styles.chipText, regionId === r.id && styles.chipTextActive]}>{r.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {comunas.length > 0 && (
          <>
            <Text style={styles.label}>Comuna</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              {comunas.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, comunaId === c.id && styles.chipActive]}
                  onPress={() => setComunaId(comunaId === c.id ? null : c.id)}
                >
                  <Text style={[styles.chipText, comunaId === c.id && styles.chipTextActive]}>{c.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[styles.chip, categoria === cat.value && styles.chipActive]}
              onPress={() => setCategoria(cat.value as CategoriaTipo)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.chipText, categoria === cat.value && styles.chipTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Dificultad de acceso</Text>
        <View style={styles.difficultyRow}>
          {DIFICULTADES.map((d) => (
            <TouchableOpacity
              key={d.nivel}
              style={[styles.difficultyChip, dificultad === d.nivel && { backgroundColor: d.color }]}
              onPress={() => setDificultad(d.nivel)}
            >
              <Text style={[styles.difficultyChipText, dificultad === d.nivel && styles.difficultyChipTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <DifficultyBar nivel={dificultad} />

        <Text style={styles.label}>Ubicación GPS</Text>
        <TouchableOpacity style={styles.locationBtn} onPress={handleGetLocation} disabled={locLoading}>
          {locLoading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.locationBtnText}>
              {lat ? `📍 ${lat.toFixed(4)}, ${lng?.toFixed(4)}` : '📍 Obtener ubicación actual'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, (saving || uploading) && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={saving || uploading}
        >
          {saving || uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Publicar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scroll: { padding: 16, paddingBottom: 110 },
  title: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 20, letterSpacing: -0.5 },
  imagePlaceholder: {
    height: 180, backgroundColor: C.surface, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 8,
  },
  imagePlaceholderText: { color: C.textMuted, fontSize: 14, fontWeight: '500' },
  thumbGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  thumbWrap: { width: THUMB, height: THUMB, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  mainBadge: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.primary + 'CC', paddingVertical: 3, alignItems: 'center',
  },
  mainBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  removeBtn: { position: 'absolute', top: 4, right: 4 },
  addMoreBtn: { width: THUMB, height: THUMB, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: C.textMuted, marginBottom: 8, marginTop: 18, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { backgroundColor: C.surface, borderRadius: 12, padding: 14, fontSize: 15, color: C.text },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  optionsScroll: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.surface, marginRight: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  chipActive: { backgroundColor: C.primary },
  chipText: { fontSize: 13, color: C.textMuted, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catEmoji: { fontSize: 14 },
  difficultyRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  difficultyChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.surface,
  },
  difficultyChipText: { fontSize: 13, color: C.textMuted, fontWeight: '500' },
  difficultyChipTextActive: { color: '#fff', fontWeight: '600' },
  locationBtn: { backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center' },
  locationBtnText: { color: C.primary, fontWeight: '500', fontSize: 14 },
  submitBtn: { backgroundColor: C.primary, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 28 },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
