import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  texto: string;
  created_at: string;
  profiles?: { username: string; avatar_url: string | null };
}

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('useComments fetch error:', error);
      setComments([]);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('useComments profiles error:', profilesError);
      }

      const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
      setComments(data.map((c) => ({ ...c, profiles: profileMap[c.user_id] })));
    } else {
      setComments([]);
    }
    setLoading(false);
  };

  const addComment = async (userId: string, texto: string): Promise<boolean> => {
    const { error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: userId, texto });
    if (error) {
      console.error('useComments addComment error:', error);
      return false;
    }
    await fetchComments();
    return true;
  };

  const deleteComment = async (commentId: string): Promise<void> => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) {
      console.error('useComments deleteComment error:', error);
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return { comments, loading, addComment, deleteComment };
}
