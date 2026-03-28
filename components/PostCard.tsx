import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { usePostsStore } from '@/stores/postsStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

interface Props {
  post: Post;
  height?: number;
}

export function PostCard({ post, height = 200 }: Props) {
  const user = useAuthStore((s) => s.user);
  const toggleSave = usePostsStore((s) => s.toggleSave);

  const handleSave = () => {
    if (!user) return;
    toggleSave(post.id, user.id);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width: CARD_WIDTH, height }]}
      onPress={() => router.push(`/lugar/${post.id}`)}
      activeOpacity={0.93}
    >
      <Image source={{ uri: post.imagen_url }} style={styles.image} contentFit="cover" />
      <View style={styles.overlay}>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={post.user_saved ? 'bookmark' : 'bookmark-outline'} size={18} color="#fff" />
        </TouchableOpacity>
        <View style={styles.bottom}>
          <Text style={styles.title} numberOfLines={2}>{post.titulo}</Text>
          {(post.rating_count ?? 0) > 0 && (
            <View style={styles.metaRow}>
              <Text style={styles.ratingText}>⭐ {(post.rating_avg ?? 0).toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#d8d8d8',
  },
  image: { width: '100%', height: '100%', position: 'absolute' },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
  },
  saveBtn: { alignSelf: 'flex-end' },
  bottom: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderRadius: 10,
    padding: 8,
    gap: 4,
  },
  title: { color: '#fff', fontSize: 12, fontWeight: '600', lineHeight: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: '#fff', fontSize: 11, fontWeight: '500' },
});
