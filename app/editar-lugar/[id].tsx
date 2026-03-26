import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { usePost } from '@/hooks/usePost';
import { useRegiones } from '@/hooks/useRegiones';
import { useComunas } from '@/hooks/useComunas';
import { usePostsStore } from '@/stores/postsStore';
import { useColors, CATEGORIAS } from '@/constants';
import type { Colors } from '@/constants';
import { CategoriaTipo } from '@/types';

export default function EditarLugarScreen() {
  const COLORS = useColors();
  const styles = getStyles(COLORS);

  const { id } = useLocalSearchParams<{ id: string }>();
  const { post, loading } = usePost(id);
  const { regiones } = useRegiones();
  const fetchPosts = usePostsStore((s) => s.fetchPosts);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<CategoriaTipo>('naturaleza');
  const [regionId, setRegionId] = useState<number | null>(null);
  const [comunaId, setComunaId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { comunas } = useComunas(regionId);

  useEffect(() => {
    if (post && !initialized) {
      setTitulo(post.titulo);
      setDescripcion(post.descripcion ?? '');
      setCategoria(post.categoria);
      setRegionId(post.region_id);
      setComunaId(post.comuna_id);
      setInitialized(true);
    }
  }, [post]);

  const handleSave = async () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('posts')
      .update({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        categoria,
        region_id: regionId,
        comuna_id: comunaId,
      })
      .eq('id', id);

    setSaving(false);
    if (error) {
      Alert.alert('Error', 'No se pudo guardar');
    } else {
      await fetchPosts(true);
      router.back();
    }
  };

  if (loading || !initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.navCancel}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Editar spot</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.navSave}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Título */}
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="¿Cómo se llama este lugar?"
          placeholderTextColor={COLORS.textMuted}
          maxLength={80}
        />

        {/* Descripción */}
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Cuéntanos sobre este spot..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={4}
          maxLength={300}
        />
        <Text style={styles.charCount}>{descripcion.length}/300</Text>

        {/* Categoría */}
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

        {/* Región */}
        <Text style={styles.label}>Región</Text>
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

        {/* Comuna */}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  navbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  navCancel: { fontSize: 16, color: C.textMuted },
  navTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  navSave: { fontSize: 16, fontWeight: '700', color: C.text },
  scroll: { padding: 16, paddingBottom: 60 },
  label: { fontSize: 13, fontWeight: '600', color: C.textMuted, marginBottom: 8, marginTop: 20, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { backgroundColor: C.surface, borderRadius: 12, padding: 14, fontSize: 15, color: C.text },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 12, color: C.textMuted, textAlign: 'right', marginTop: 4 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catEmoji: { fontSize: 14 },
  optionsScroll: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.surface, marginRight: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  chipActive: { backgroundColor: C.primary },
  chipText: { fontSize: 13, color: C.textMuted, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
});
