import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, Post } from '@/types';

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    const [profileRes, postsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase
        .from('posts')
        .select('*, regiones(id, nombre)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (postsRes.data) setPosts(postsRes.data);
    setLoading(false);
  };

  return { profile, posts, loading, refetch: fetchProfile };
}
