import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '@/hooks/useProfile';
import { PostCard } from '@/components/PostCard';
import { Avatar } from '@/components/Avatar';
import { useColors } from '@/constants';
import type { Colors } from '@/constants';

export default function PublicProfileScreen() {
  const COLORS = useColors();
  const styles = getStyles(COLORS);

  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, posts, loading } = useProfile(id);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  const totalLikes = posts.reduce((acc, p) => acc + p.likes_count, 0);

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
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>

            <View style={{ marginBottom: 12 }}>
              <Avatar uri={profile?.avatar_url} username={profile?.username} size={84} />
            </View>

            <Text style={styles.username}>@{profile?.username}</Text>
            {profile?.full_name && <Text style={styles.fullName}>{profile.full_name}</Text>}
            {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{posts.length}</Text>
                <Text style={styles.statLabel}>lugares</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalLikes}</Text>
                <Text style={styles.statLabel}>likes</Text>
              </View>
            </View>

            {posts.length > 0 && (
              <Text style={styles.sectionTitle}>Spots de {profile?.username}</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏔️</Text>
            <Text style={styles.emptyText}>Aún no ha subido lugares</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 20, padding: 4 },
  username: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 2 },
  fullName: { fontSize: 14, color: C.textMuted },
  bio: { fontSize: 14, color: C.textMuted, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20, marginTop: 6 },
  stats: { flexDirection: 'row', marginTop: 20, marginBottom: 24, alignItems: 'center' },
  statItem: { alignItems: 'center', paddingHorizontal: 32 },
  statNumber: { fontSize: 22, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 12, color: C.textMuted, marginTop: 1 },
  statDivider: { width: 1, height: 28, backgroundColor: C.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.text, alignSelf: 'flex-start', marginBottom: 12 },
  grid: { paddingHorizontal: 12, paddingBottom: 100 },
  row: { gap: 10, marginBottom: 10 },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 15, color: C.textMuted },
});
