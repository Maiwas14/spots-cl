import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import { useAuthStore } from '@/stores/authStore';

export function usePost(id: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!id) return;
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);

    const { data: postData, error } = await supabase
      .from('posts')
      .select('*, regiones(id, nombre), comunas(id, nombre)')
      .eq('id', id)
      .single();

    if (error || !postData) {
      console.error('usePost error:', error);
      setPost(null);
      setLoading(false);
      return;
    }

    // Fetch profile separately
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio')
      .eq('id', postData.user_id)
      .single();

    let post = { ...postData, profiles: profileData ?? undefined };

    if (user) {
      const [likeRes, saveRes] = await Promise.all([
        supabase.from('likes').select('user_id').eq('post_id', id).eq('user_id', user.id).single(),
        supabase.from('guardados').select('user_id').eq('post_id', id).eq('user_id', user.id).single(),
      ]);
      post = { ...post, user_liked: !!likeRes.data, user_saved: !!saveRes.data };
    }

    setPost(post);
    setLoading(false);
  };

  return { post, loading, setPost, refetch: fetchPost };
}
