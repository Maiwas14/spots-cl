import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
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
  const toggleLike = usePostsStore((s) => s.toggleLike);
  const toggleSave = usePostsStore((s) => s.toggleSave);

  const handleLike = () => {
    if (!user) return;
    toggleLike(post.id, user.id);
  };

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
          <Text style={styles.saveIcon}>{post.user_saved ? '🔖' : '🏳️'}</Text>
        </TouchableOpacity>
        <View style={styles.bottom}>
          <Text style={styles.title} numberOfLines={2}>{post.titulo}</Text>
          <TouchableOpacity style={styles.likeRow} onPress={handleLike}>
            <Text style={styles.likeIcon}>{post.user_liked ? '❤️' : '🤍'}</Text>
            <Text style={styles.likeCount}>{post.likes_count}</Text>
          </TouchableOpacity>
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
  saveIcon: { fontSize: 16 },
  bottom: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderRadius: 10,
    padding: 8,
    gap: 4,
  },
  title: { color: '#fff', fontSize: 12, fontWeight: '600', lineHeight: 16 },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeIcon: { fontSize: 12 },
  likeCount: { color: '#fff', fontSize: 11, fontWeight: '500' },
});
