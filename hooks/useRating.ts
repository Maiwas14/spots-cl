import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export function useRating(postId: string) {
  const user = useAuthStore((s) => s.user);
  const [submitting, setSubmitting] = useState(false);

  const rate = async (stars: number): Promise<{ avg: number; count: number } | null> => {
    if (!user) return null;
    setSubmitting(true);

    const { error } = await supabase.from('ratings').upsert(
      { user_id: user.id, post_id: postId, stars },
      { onConflict: 'user_id,post_id' }
    );

    if (error) {
      setSubmitting(false);
      return null;
    }

    // Fetch updated avg/count from the post (trigger already updated it)
    const { data } = await supabase
      .from('posts')
      .select('rating_avg, rating_count')
      .eq('id', postId)
      .single();

    setSubmitting(false);
    if (!data) return null;
    return { avg: data.rating_avg, count: data.rating_count };
  };

  const fetchUserRating = async (): Promise<number | null> => {
    if (!user) return null;
    const { data } = await supabase
      .from('ratings')
      .select('stars')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();
    return data?.stars ?? null;
  };

  return { rate, fetchUserRating, submitting };
}
