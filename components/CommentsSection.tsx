import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useComments } from '@/hooks/useComments';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/Avatar';
import { COLORS } from '@/constants';

interface Props {
  postId: string;
}

export function CommentsSection({ postId }: Props) {
  const { comments, loading, addComment, deleteComment } = useComments(postId);
  const { user, profile } = useAuthStore();
  const [texto, setTexto] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!texto.trim() || !user) return;
    setSending(true);
    const ok = await addComment(user.id, texto.trim());
    if (ok) setTexto('');
    setSending(false);
  };

  const handleDelete = (commentId: string) => {
    Alert.alert('Eliminar comentario', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteComment(commentId) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Comentarios {comments.length > 0 && <Text style={styles.count}>({comments.length})</Text>}
      </Text>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
      ) : comments.length === 0 ? (
        <Text style={styles.empty}>Sé el primero en comentar</Text>
      ) : (
        comments.map((c) => (
          <View key={c.id} style={styles.comment}>
            <Avatar uri={c.profiles?.avatar_url} username={c.profiles?.username} size={32} />
            <View style={styles.commentBody}>
              <View style={styles.commentHeader}>
                <Text style={styles.username}>@{c.profiles?.username}</Text>
                <Text style={styles.time}>
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: es })}
                </Text>
              </View>
              <Text style={styles.texto}>{c.texto}</Text>
            </View>
            {c.user_id === user?.id && (
              <TouchableOpacity onPress={() => handleDelete(c.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={15} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      {/* Input */}
      {user && (
        <View style={styles.inputRow}>
          <Avatar uri={profile?.avatar_url} username={profile?.username} size={32} />
          <TextInput
            style={styles.input}
            placeholder="Agrega un comentario..."
            placeholderTextColor={COLORS.textMuted}
            value={texto}
            onChangeText={setTexto}
            multiline
            maxLength={300}
          />
          <TouchableOpacity onPress={handleSend} disabled={!texto.trim() || sending} style={styles.sendBtn}>
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="send" size={18} color={texto.trim() ? COLORS.primary : '#ccc'} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  count: { color: COLORS.textMuted, fontWeight: '400' },
  empty: { fontSize: 14, color: COLORS.textMuted, marginBottom: 16 },
  comment: { flexDirection: 'row', gap: 10, marginBottom: 16, alignItems: 'flex-start' },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  username: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  time: { fontSize: 11, color: COLORS.textMuted },
  texto: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16, marginTop: 4,
  },
  input: {
    flex: 1, fontSize: 14, color: COLORS.text,
    backgroundColor: COLORS.surface, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, maxHeight: 80,
  },
  sendBtn: { padding: 4 },
});
