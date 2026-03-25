import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostsStore } from '@/stores/postsStore';
import { useRegiones } from '@/hooks/useRegiones';
import { useComunas } from '@/hooks/useComunas';
import { PostCard } from '@/components/PostCard';
import { SkeletonGrid } from '@/components/SkeletonCard';
import { useColors, CATEGORIAS } from '@/constants';
import type { Colors } from '@/constants';

export default function FeedScreen() {
  const COLORS = useColors();
  const styles = getStyles(COLORS);

  const {
    posts, loading, hasMore,
    regionFilter, comunaFilter, categoriaFilter, searchQuery, sortBy,
    fetchPosts, setRegionFilter, setComunaFilter, setCategoriaFilter, setSearchQuery, setSortBy,
  } = usePostsStore();
  const { regiones } = useRegiones();
  const { comunas } = useComunas(regionFilter);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchPosts(true);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, []);

  const handleSearch = (text: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchQuery(text), 400);
  };

  const renderItem = ({ item, index }: any) => {
    const height = index % 3 === 0 ? 240 : 190;
    return <PostCard post={item} height={height} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Spots</Text>
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'recent' && styles.sortBtnActive]}
            onPress={() => setSortBy('recent')}
          >
            <Text style={[styles.sortText, sortBy === 'recent' && styles.sortTextActive]}>Recientes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'popular' && styles.sortBtnActive]}
            onPress={() => setSortBy('popular')}
          >
            <Ionicons name="flame" size={13} color={sortBy === 'popular' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.sortText, sortBy === 'popular' && styles.sortTextActive]}> Popular</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar lugares..."
          placeholderTextColor={COLORS.textMuted}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Region filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.chip, !regionFilter && styles.chipActive]}
          onPress={() => setRegionFilter(null)}
        >
          <Text style={[styles.chipText, !regionFilter && styles.chipTextActive]}>Todo Chile</Text>
        </TouchableOpacity>
        {regiones.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.chip, regionFilter === r.id && styles.chipActive]}
            onPress={() => setRegionFilter(regionFilter === r.id ? null : r.id)}
          >
            <Text style={[styles.chipText, regionFilter === r.id && styles.chipTextActive]}>{r.nombre}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Comuna filter */}
      {comunas.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScroll}>
          {comunas.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, comunaFilter === c.id && styles.chipActive]}
              onPress={() => setComunaFilter(comunaFilter === c.id ? null : c.id)}
            >
              <Text style={[styles.chipText, comunaFilter === c.id && styles.chipTextActive]}>{c.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScroll}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.chip, categoriaFilter === cat.value && styles.chipActive]}
            onPress={() => setCategoriaFilter(categoriaFilter === cat.value ? null : cat.value)}
          >
            <Text style={[styles.chipText, categoriaFilter === cat.value && styles.chipTextActive]}>
              {cat.emoji} {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      {loading && posts.length === 0 ? (
        <SkeletonGrid />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          onEndReached={() => posts.length > 0 && hasMore && !loading && fetchPosts()}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={loading && posts.length > 0}
              onRefresh={() => fetchPosts(true)}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏔️</Text>
              <Text style={styles.emptyText}>Sin resultados</Text>
              <Text style={styles.emptySubtext}>Prueba con otro filtro o búsqueda</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  logo: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -1 },
  sortRow: { flexDirection: 'row', gap: 6 },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.surface,
  },
  sortBtnActive: { backgroundColor: C.primary },
  sortText: { fontSize: 12, color: C.textMuted, fontWeight: '500' },
  sortTextActive: { color: '#fff', fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    marginHorizontal: 14,
    marginBottom: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  filterScroll: { flexGrow: 0 },
  filterRow: { paddingHorizontal: 14, paddingVertical: 4, gap: 7 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surface },
  chipActive: { backgroundColor: C.primary },
  chipText: { fontSize: 13, color: C.textMuted, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  grid: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 100 },
  row: { gap: 12, marginBottom: 12 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: C.text },
  emptySubtext: { fontSize: 14, color: C.textMuted, marginTop: 4 },
});
