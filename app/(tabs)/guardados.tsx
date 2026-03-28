import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { PostCard } from '@/components/PostCard';
import { Post } from '@/types';
import { useColors } from '@/constants';
import type { Colors } from '@/constants';

export default function GuardadosScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchSaved();
    }, [user])
  );

  const fetchSaved = async () => {
    setLoading(true);
    const { data: saved, error: savedError } = await supabase
      .from('guardados')
      .select('post_id')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (savedError) {
      console.error('guardados fetch error:', savedError);
      setPosts([]);
      setLoading(false);
      return;
    }

    if (!saved || saved.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*, regiones(id, nombre)')
      .in('id', saved.map((s) => s.post_id));

    if (error) {
      console.error('guardados posts fetch error:', error);
    }

    if (data) setPosts(data.map((p) => ({ ...p, user_saved: true })) as Post[]);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSaved();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading && !refreshing ? (
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
          removeClippedSubviews={true}
          maxToRenderPerBatch={6}
          windowSize={10}
          initialNumToRender={6}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={<Text style={styles.title}>Guardados</Text>}
          renderItem={({ item, index }) => (
            <PostCard post={item} height={index % 3 === 0 ? 230 : 185} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔖</Text>
              <Text style={styles.emptyText}>Nada guardado aun</Text>
              <Text style={styles.emptySubtext}>Toca el icono de guardado en cualquier lugar para guardarlo</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5, paddingHorizontal: 4, paddingBottom: 16 },
  grid: { paddingHorizontal: 12, paddingTop: 20, paddingBottom: 100 },
  row: { gap: 10, marginBottom: 10 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '600', color: C.text, marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: C.textMuted, textAlign: 'center', paddingHorizontal: 32 },
});
