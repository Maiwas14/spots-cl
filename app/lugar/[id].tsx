import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Linking,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === 'storeClient';
let MapView: any = null;
let Marker: any = null;
if (!isExpoGo) {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

import { usePost } from '@/hooks/usePost';
import { useAuthStore } from '@/stores/authStore';
import { usePostsStore } from '@/stores/postsStore';
import { supabase } from '@/lib/supabase';
import { useColors, CATEGORIAS } from '@/constants';
import type { Colors } from '@/constants';
import { ImageCarousel } from '@/components/ImageCarousel';
import { CommentsSection } from '@/components/CommentsSection';
import { ZoomableImage } from '@/components/ZoomableImage';
import { DifficultyBar } from '@/components/DifficultyBar';
import { StarRating } from '@/components/StarRating';
import { useRating } from '@/hooks/useRating';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.78;

export default function LugarScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

  const { id } = useLocalSearchParams<{ id: string }>();
  const { post, loading, setPost } = usePost(id);
  const { rate } = useRating(id);
  const { user } = useAuthStore();
  const updatePostInStore = usePostsStore((s) => s.updatePostInStore);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [zoomUri, setZoomUri] = useState<string | null>(null);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('post_images')
      .select('url, orden')
      .eq('post_id', id)
      .order('orden')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching post images:', error);
          return;
        }
        if (data && data.length > 1) {
          setExtraImages(data.map((d) => d.url));
        }
      });
  }, [id]);

  const handleSave = async () => {
    if (!user || !post) return;
    const saved = post.user_saved;
    setPost({ ...post, user_saved: !saved });
    updatePostInStore(post.id, { user_saved: !saved });
    let error;
    if (saved) {
      ({ error } = await supabase.from('guardados').delete().eq('post_id', post.id).eq('user_id', user.id));
    } else {
      ({ error } = await supabase.from('guardados').insert({ post_id: post.id, user_id: user.id }));
    }
    if (error) {
      setPost({ ...post, user_saved: saved });
      updatePostInStore(post.id, { user_saved: saved });
    }
  };

  const handleNavigate = () => {
    if (!post?.lat || !post?.lng) {
      Alert.alert('Sin ubicación', 'Este lugar no tiene coordenadas GPS');
      return;
    }
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${post.lat},${post.lng}`);
  };

  const handleShare = async () => {
    if (!post) return;
    await Share.share({ message: `Mira este spot en Chile: ${post.titulo} 📍`, title: post.titulo });
  };

  const handleRate = async (stars: number) => {
    if (!post) return;
    const result = await rate(stars);
    if (result) {
      setPost({ ...post, user_rating: stars, rating_avg: result.avg, rating_count: result.count });
      setRatingSuccess(true);
      setTimeout(() => setRatingSuccess(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!post || post.user_id !== user?.id) return;
    Alert.alert('Eliminar spot', '¿Seguro que quieres eliminar este spot?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          // Clean up images from storage
          const { data: images } = await supabase
            .from('post_images')
            .select('url')
            .eq('post_id', post.id);
          if (images && images.length > 0) {
            const paths = images.map((img) => {
              const parts = img.url.split('/lugares/');
              return parts[1]?.split('?')[0];
            }).filter(Boolean) as string[];
            if (paths.length > 0) {
              await supabase.storage.from('lugares').remove(paths);
            }
          }
          await supabase.from('posts').delete().eq('id', post.id);
          router.back();
        },
      },
    ]);
  };

  const categoria = CATEGORIAS.find((c) => c.value === post?.categoria);
  const timeAgo = post?.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })
    : '';

  const allImages = extraImages.length > 0 ? extraImages : (post?.imagen_url ? [post.imagen_url] : []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFound}>Lugar no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ZoomableImage
          uri={zoomUri ?? ''}
          visible={!!zoomUri}
          onClose={() => setZoomUri(null)}
        />

        <View style={styles.imageContainer}>
          {allImages.length > 1 ? (
            <ImageCarousel urls={allImages} height={IMAGE_HEIGHT} onImagePress={(url) => setZoomUri(url)} />
          ) : (
            <TouchableOpacity activeOpacity={0.95} onPress={() => setZoomUri(post.imagen_url)}>
              <Image source={{ uri: post.imagen_url }} style={[styles.heroImage, { height: IMAGE_HEIGHT }]} contentFit="cover" />
            </TouchableOpacity>
          )}
          <SafeAreaView edges={['top']} style={styles.heroControls}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.tagsRow}>
            {categoria && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{categoria.emoji} {categoria.label}</Text>
              </View>
            )}
            {post.regiones && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>📍 {post.regiones.nombre}</Text>
              </View>
            )}
            {post.comunas && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>🏘️ {post.comunas.nombre}</Text>
              </View>
            )}
            <View style={[styles.tag, styles.tagDifficulty]}>
              <DifficultyBar nivel={post.dificultad ?? 1} />
            </View>
          </View>

          <Text style={styles.title}>{post.titulo}</Text>
          {post.descripcion && <Text style={styles.description}>{post.descripcion}</Text>}
          <Text style={styles.timeAgo}>{timeAgo}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, post.user_saved && styles.actionBtnSaved]} onPress={handleSave}>
              <Ionicons name={post.user_saved ? 'bookmark' : 'bookmark-outline'} size={18} color={post.user_saved ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.actionBtnText, post.user_saved && styles.actionBtnTextSaved]}>
                {post.user_saved ? 'Guardado' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingContainer}>
            <StarRating
              avg={post.rating_avg ?? 0}
              count={post.rating_count ?? 0}
              userRating={post.user_rating}
              onRate={handleRate}
            />
            {ratingSuccess && (
              <Text style={styles.ratingSuccess}>Gracias por valorar!</Text>
            )}
          </View>

          {post.lat && post.lng && (
            <TouchableOpacity style={styles.navigateBtn} onPress={handleNavigate}>
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.navigateBtnText}>Cómo llegar</Text>
            </TouchableOpacity>
          )}

          {post.lat && post.lng && MapView && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{ latitude: post.lat, longitude: post.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker coordinate={{ latitude: post.lat, longitude: post.lng }}>
                  <Text style={{ fontSize: 28 }}>📍</Text>
                </Marker>
              </MapView>
            </View>
          )}

          {post.profiles && (
            <TouchableOpacity
              style={styles.authorCard}
              onPress={() => router.push(`/perfil/${post.profiles!.id}`)}
            >
              {post.profiles.avatar_url ? (
                <Image source={{ uri: post.profiles.avatar_url }} style={styles.authorAvatarImg} contentFit="cover" />
              ) : (
                <View style={styles.authorAvatarPlaceholder}>
                  <Text style={styles.authorAvatarInitial}>{(post.profiles.username || 'U')[0].toUpperCase()}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.authorLabel}>Publicado por</Text>
                <Text style={styles.authorUsername}>@{post.profiles.username}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}

          {post.user_id === user?.id && (
            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/editar-lugar/${post.id}`)}>
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}

          <CommentsSection postId={post.id} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  notFound: { fontSize: 18, color: C.text, marginBottom: 12 },
  backLink: { color: C.primary, fontSize: 16 },
  imageContainer: { position: 'relative' },
  heroImage: { width },
  heroControls: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: 20 },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  tag: { backgroundColor: C.surface, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  tagDifficulty: { paddingVertical: 6 },
  tagText: { fontSize: 13, color: C.textMuted, fontWeight: '500' },
  ratingContainer: { marginBottom: 16 },
  ratingSuccess: { fontSize: 13, color: C.success, fontWeight: '600', marginTop: 6 },
  title: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 10, lineHeight: 30, letterSpacing: -0.3 },
  description: { fontSize: 15, color: C.textMuted, lineHeight: 22, marginBottom: 8 },
  timeAgo: { fontSize: 12, color: C.textMuted, marginBottom: 20 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: C.surface,
  },
  actionBtnSaved: { backgroundColor: C.scheme === 'dark' ? 'rgba(61,139,94,0.15)' : '#f0f5f2' },
  actionBtnText: { fontSize: 14, color: C.textMuted, fontWeight: '500' },
  actionBtnTextSaved: { color: C.primary },
  navigateBtn: {
    backgroundColor: C.primary, borderRadius: 12, padding: 15,
    alignItems: 'center', marginBottom: 20, flexDirection: 'row',
    justifyContent: 'center', gap: 8,
  },
  navigateBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  mapContainer: { height: 180, borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  map: { flex: 1 },
  authorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 16,
  },
  authorAvatarImg: { width: 42, height: 42, borderRadius: 21 },
  authorAvatarPlaceholder: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: C.border, alignItems: 'center', justifyContent: 'center',
  },
  authorAvatarInitial: { color: C.text, fontSize: 17, fontWeight: '700' },
  authorLabel: { fontSize: 11, color: C.textMuted },
  authorUsername: { fontSize: 14, fontWeight: '600', color: C.text },
  ownerActions: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  editBtn: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: C.surface },
  editBtnText: { color: C.text, fontSize: 14, fontWeight: '500' },
  deleteBtn: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: C.scheme === 'dark' ? 'rgba(239,68,68,0.12)' : '#fff5f5' },
  deleteBtnText: { color: '#ef4444', fontSize: 14, fontWeight: '500' },
});
