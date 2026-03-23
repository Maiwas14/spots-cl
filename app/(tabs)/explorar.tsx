import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useRegiones } from '@/hooks/useRegiones';
import { Post } from '@/types';
import { COLORS } from '@/constants';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

let MapView: any = null;
let Marker: any = null;
let Callout: any = null;
if (!isExpoGo) {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
}

const CHILE_CENTER = { latitude: -35.6751, longitude: -71.543 };

export default function ExplorarScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [view, setView] = useState<'map' | 'list'>('map');
  const { regiones } = useRegiones();

  useEffect(() => {
    fetchPostsWithLocation();
  }, [selectedRegion]);

  const fetchPostsWithLocation = async () => {
    let query = supabase
      .from('posts')
      .select('id, titulo, imagen_url, lat, lng, categoria, region_id, regiones(nombre)')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .limit(200);

    if (selectedRegion) query = query.eq('region_id', selectedRegion);

    const { data } = await query;
    if (data) setPosts(data as unknown as Post[]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'map' && styles.toggleActive]}
            onPress={() => setView('map')}
          >
            <Text style={[styles.toggleText, view === 'map' && styles.toggleTextActive]}>🗺️ Mapa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'list' && styles.toggleActive]}
            onPress={() => setView('list')}
          >
            <Text style={[styles.toggleText, view === 'list' && styles.toggleTextActive]}>≡ Lista</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        horizontal
        data={[{ id: null, nombre: 'Todas' }, ...regiones] as any[]}
        keyExtractor={(item) => String(item.id ?? 'all')}
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.regionRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, selectedRegion === item.id && styles.chipActive]}
            onPress={() => setSelectedRegion(item.id)}
          >
            <Text style={[styles.chipText, selectedRegion === item.id && styles.chipTextActive]}>
              {item.nombre}
            </Text>
          </TouchableOpacity>
        )}
      />

      {view === 'map' && !MapView ? (
        <View style={styles.mapFallback}>
          <Text style={styles.mapFallbackIcon}>🗺️</Text>
          <Text style={styles.mapFallbackTitle}>Mapa no disponible en Expo Go</Text>
          <Text style={styles.mapFallbackSub}>Crea un development build para ver el mapa interactivo</Text>
        </View>
      ) : view === 'map' ? (
        <MapView
          style={styles.map}
          initialRegion={{ ...CHILE_CENTER, latitudeDelta: 18, longitudeDelta: 12 }}
        >
          {posts.map((post) =>
            post.lat && post.lng ? (
              <Marker
                key={post.id}
                coordinate={{ latitude: post.lat, longitude: post.lng }}
                onCalloutPress={() => router.push(`/lugar/${post.id}`)}
              >
                <View style={styles.markerContainer}>
                  <Text style={styles.markerEmoji}>📍</Text>
                </View>
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle} numberOfLines={2}>{post.titulo}</Text>
                    <Text style={styles.calloutSub}>Toca para ver más →</Text>
                  </View>
                </Callout>
              </Marker>
            ) : null
          )}
        </MapView>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listItem} onPress={() => router.push(`/lugar/${item.id}`)}>
              <Text style={styles.listTitle}>{item.titulo}</Text>
              <Text style={styles.listSub}>{(item as any).regiones?.nombre}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>Sin lugares con ubicación aún</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: -1 },
  viewToggle: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 10, padding: 2 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  toggleActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 13, color: COLORS.textMuted },
  toggleTextActive: { color: COLORS.text, fontWeight: '600' },
  filterScroll: { flexGrow: 0 },
  regionRow: { paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  map: { flex: 1 },
  mapFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eef2ee', paddingHorizontal: 32 },
  mapFallbackIcon: { fontSize: 56, marginBottom: 16 },
  mapFallbackTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  mapFallbackSub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  markerContainer: { alignItems: 'center' },
  markerEmoji: { fontSize: 28 },
  callout: { width: 160, padding: 8 },
  calloutTitle: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  calloutSub: { fontSize: 11, color: COLORS.primary, marginTop: 4 },
  list: { padding: 16, gap: 12 },
  listItem: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16 },
  listTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  listSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  emptyList: { alignItems: 'center', paddingTop: 60 },
  emptyListText: { fontSize: 15, color: COLORS.textMuted },
});
