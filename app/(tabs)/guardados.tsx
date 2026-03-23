import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { PostCard } from '@/components/PostCard';
import { Post } from '@/types';
import { COLORS } from '@/constants';

export default function GuardadosScreen() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchSaved();
    }, [user])
  );

  const fetchSaved = async () => {
    setLoading(true);
    const { data: saved } = await supabase
      .from('guardados')
      .select('post_id')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!saved || saved.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('posts')
      .select('*, regiones(id, nombre)')
      .in('id', saved.map((s) => s.post_id));

    if (data) setPosts(data.map((p) => ({ ...p, user_saved: true })) as Post[]);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          ListHeaderComponent={<Text style={styles.title}>Guardados</Text>}
          renderItem={({ item, index }) => (
            <PostCard post={item} height={index % 3 === 0 ? 230 : 185} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔖</Text>
              <Text style={styles.emptyText}>Nada guardado aún</Text>
              <Text style={styles.emptySubtext}>Toca 🏳️ en cualquier lugar para guardarlo</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5, paddingHorizontal: 4, paddingBottom: 16 },
  grid: { paddingHorizontal: 12, paddingTop: 20, paddingBottom: 100 },
  row: { gap: 10, marginBottom: 10 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 32 },
});
