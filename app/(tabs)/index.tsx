import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { useEffect, useRef, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostsStore } from '@/stores/postsStore';
import { useRegiones } from '@/hooks/useRegiones';
import { useComunas } from '@/hooks/useComunas';
import { PostCard } from '@/components/PostCard';
import { SkeletonGrid } from '@/components/SkeletonCard';
import { useColors, CATEGORIAS, DIFICULTADES } from '@/constants';
import type { Colors } from '@/constants';

export default function FeedScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

  const {
    posts, loading, hasMore,
    regionFilter, comunaFilter, categoriaFilter, dificultadFilter, searchQuery, sortBy,
    fetchPosts, setRegionFilter, setComunaFilter, setCategoriaFilter, setDificultadFilter, setSearchQuery, setSortBy,
  } = usePostsStore();
  const { regiones } = useRegiones();
  const { comunas } = useComunas(regionFilter);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Temporary filter state for modal
  const [tempRegion, setTempRegion] = useState<number | null>(regionFilter);
  const [tempComuna, setTempComuna] = useState<number | null>(comunaFilter);
  const [tempCategoria, setTempCategoria] = useState<string | null>(categoriaFilter);
  const [tempDificultad, setTempDificultad] = useState<number | null>(dificultadFilter);

  const tempComunas = useComunas(tempRegion);

  useEffect(() => {
    fetchPosts(true);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, []);

  const handleSearch = (text: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchQuery(text), 400);
  };

  const activeFilterCount = [regionFilter, comunaFilter, categoriaFilter, dificultadFilter].filter(Boolean).length;

  const openFilterModal = () => {
    setTempRegion(regionFilter);
    setTempComuna(comunaFilter);
    setTempCategoria(categoriaFilter);
    setTempDificultad(dificultadFilter);
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
    // Apply changes only for filters that actually changed
    if (tempRegion !== regionFilter) {
      setRegionFilter(tempRegion);
    }
    if (tempComuna !== comunaFilter) {
      setComunaFilter(tempComuna);
    }
    if (tempCategoria !== categoriaFilter) {
      setCategoriaFilter(tempCategoria);
    }
    if (tempDificultad !== dificultadFilter) {
      setDificultadFilter(tempDificultad);
    }
  };

  const clearAllFilters = () => {
    setTempRegion(null);
    setTempComuna(null);
    setTempCategoria(null);
    setTempDificultad(null);
  };

  const renderItem = ({ item, index }: { item: (typeof posts)[0]; index: number }) => {
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

      {/* Search + Filter button row */}
      <View style={styles.searchFilterRow}>
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
        <TouchableOpacity style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]} onPress={openFilterModal}>
          <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? '#fff' : COLORS.textMuted} />
          <Text style={[styles.filterBtnText, activeFilterCount > 0 && styles.filterBtnTextActive]}>
            {activeFilterCount > 0 ? `Filtros (${activeFilterCount})` : 'Filtros'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.modalClear}>Limpiar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {/* Region */}
            <Text style={styles.modalSectionLabel}>Region</Text>
            <View style={styles.modalChipGrid}>
              <TouchableOpacity
                style={[styles.chip, !tempRegion && styles.chipActive]}
                onPress={() => { setTempRegion(null); setTempComuna(null); }}
              >
                <Text style={[styles.chipText, !tempRegion && styles.chipTextActive]}>Todo Chile</Text>
              </TouchableOpacity>
              {regiones.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.chip, tempRegion === r.id && styles.chipActive]}
                  onPress={() => { setTempRegion(tempRegion === r.id ? null : r.id); setTempComuna(null); }}
                >
                  <Text style={[styles.chipText, tempRegion === r.id && styles.chipTextActive]}>{r.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comuna */}
            {tempComunas.comunas.length > 0 && (
              <>
                <Text style={styles.modalSectionLabel}>Comuna</Text>
                <View style={styles.modalChipGrid}>
                  {tempComunas.comunas.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.chip, tempComuna === c.id && styles.chipActive]}
                      onPress={() => setTempComuna(tempComuna === c.id ? null : c.id)}
                    >
                      <Text style={[styles.chipText, tempComuna === c.id && styles.chipTextActive]}>{c.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Category */}
            <Text style={styles.modalSectionLabel}>Categoria</Text>
            <View style={styles.modalChipGrid}>
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.chip, tempCategoria === cat.value && styles.chipActive]}
                  onPress={() => setTempCategoria(tempCategoria === cat.value ? null : cat.value)}
                >
                  <Text style={[styles.chipText, tempCategoria === cat.value && styles.chipTextActive]}>
                    {cat.emoji} {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Difficulty */}
            <Text style={styles.modalSectionLabel}>Dificultad</Text>
            <View style={styles.modalChipGrid}>
              {DIFICULTADES.map((d) => (
                <TouchableOpacity
                  key={d.nivel}
                  style={[styles.chip, tempDificultad === d.nivel && { backgroundColor: d.color }]}
                  onPress={() => setTempDificultad(tempDificultad === d.nivel ? null : d.nivel)}
                >
                  <Text style={[styles.chipText, tempDificultad === d.nivel && styles.chipTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <Text style={styles.applyBtnText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

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
          removeClippedSubviews={true}
          maxToRenderPerBatch={6}
          windowSize={10}
          initialNumToRender={6}
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
              <Text style={styles.emptySubtext}>Prueba con otro filtro o busqueda</Text>
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
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 6,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    height: 40,
  },
  filterBtnActive: { backgroundColor: C.primary },
  filterBtnText: { fontSize: 13, color: C.textMuted, fontWeight: '500' },
  filterBtnTextActive: { color: '#fff', fontWeight: '600' },
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: C.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  modalClear: { fontSize: 14, color: C.primary, fontWeight: '600' },
  modalScroll: { padding: 16, paddingBottom: 32 },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  modalChipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  applyBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
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
