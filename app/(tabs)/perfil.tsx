import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProfile } from '@/hooks/useProfile';
import { PostCard } from '@/components/PostCard';
import { Avatar } from '@/components/Avatar';
import { useColors } from '@/constants';
import type { Colors } from '@/constants';

export default function PerfilScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

  const { user, profile: authProfile, signOut } = useAuthStore();
  const { profile, posts, loading, refetch } = useProfile(user?.id ?? '');

  useFocusEffect(useCallback(() => { refetch(); }, []));

  const handleSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut },
    ]);
  };

  const displayProfile = profile || authProfile;
  const totalRatings = posts.reduce((acc, p) => acc + (p.rating_count ?? 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => (
          <PostCard post={item} height={index % 3 === 0 ? 230 : 185} />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/editar-perfil')} style={{ marginBottom: 12 }}>
              <Avatar uri={displayProfile?.avatar_url} username={displayProfile?.username} size={84} />
            </TouchableOpacity>

            <Text style={styles.username}>@{displayProfile?.username}</Text>
            {displayProfile?.full_name ? (
              <Text style={styles.fullName}>{displayProfile.full_name}</Text>
            ) : null}
            {displayProfile?.bio ? (
              <Text style={styles.bio}>{displayProfile.bio}</Text>
            ) : null}

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{posts.length}</Text>
                <Text style={styles.statLabel}>lugares</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalRatings}</Text>
                <Text style={styles.statLabel}>valoraciones</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/editar-perfil')}>
                <Text style={styles.editBtnText}>Editar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Salir</Text>
              </TouchableOpacity>
            </View>

            {posts.length > 0 && <Text style={styles.sectionTitle}>Mis spots</Text>}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏔️</Text>
              <Text style={styles.emptyText}>Aún no has subido lugares</Text>
              <TouchableOpacity style={styles.uploadCta} onPress={() => router.push('/(tabs)/subir')}>
                <Text style={styles.uploadCtaText}>+ Subir primer spot</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 24 }} />
          )
        }
      />
    </SafeAreaView>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8, alignItems: 'center' },
  username: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 2 },
  fullName: { fontSize: 14, color: C.textMuted },
  bio: { fontSize: 14, color: C.textMuted, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20, marginTop: 6 },
  stats: { flexDirection: 'row', marginTop: 20, marginBottom: 20, alignItems: 'center' },
  statItem: { alignItems: 'center', paddingHorizontal: 32 },
  statNumber: { fontSize: 22, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 12, color: C.textMuted, marginTop: 1 },
  statDivider: { width: 1, height: 28, backgroundColor: C.border },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 24, width: '100%' },
  editBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center' },
  editBtnText: { color: C.text, fontSize: 14, fontWeight: '600' },
  signOutBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: C.surface },
  signOutText: { color: C.textMuted, fontSize: 14, fontWeight: '500' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.text, alignSelf: 'flex-start', marginBottom: 12 },
  grid: { paddingHorizontal: 12, paddingBottom: 100 },
  row: { gap: 10, marginBottom: 10 },
  empty: { alignItems: 'center', paddingTop: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 15, color: C.textMuted, marginBottom: 16 },
  uploadCta: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: C.primary },
  uploadCtaText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
