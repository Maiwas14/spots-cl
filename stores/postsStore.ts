import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import { POSTS_PER_PAGE } from '@/constants';

interface PostsState {
  posts: Post[];
  loading: boolean;
  hasMore: boolean;
  page: number;
  regionFilter: number | null;
  comunaFilter: number | null;
  categoriaFilter: string | null;
  searchQuery: string;
  sortBy: 'recent' | 'popular';
  setRegionFilter: (id: number | null) => void;
  setComunaFilter: (id: number | null) => void;
  setCategoriaFilter: (cat: string | null) => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (sort: 'recent' | 'popular') => void;
  fetchPosts: (reset?: boolean) => Promise<void>;
  toggleLike: (postId: string, userId: string) => Promise<void>;
  toggleSave: (postId: string, userId: string) => Promise<void>;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: false,
  hasMore: true,
  page: 0,
  regionFilter: null,
  comunaFilter: null,
  categoriaFilter: null,
  searchQuery: '',
  sortBy: 'recent',

  setRegionFilter: (id) => {
    set({ regionFilter: id, comunaFilter: null, page: 0, posts: [], hasMore: true });
    get().fetchPosts(true);
  },

  setComunaFilter: (id) => {
    set({ comunaFilter: id, page: 0, posts: [], hasMore: true });
    get().fetchPosts(true);
  },

  setCategoriaFilter: (cat) => {
    set({ categoriaFilter: cat, page: 0, posts: [], hasMore: true });
    get().fetchPosts(true);
  },

  setSearchQuery: (q) => {
    set({ searchQuery: q, page: 0, posts: [], hasMore: true });
    get().fetchPosts(true);
  },

  setSortBy: (sort) => {
    set({ sortBy: sort, page: 0, posts: [], hasMore: true });
    get().fetchPosts(true);
  },

  fetchPosts: async (reset = false) => {
    const { loading, page, regionFilter, comunaFilter, categoriaFilter, searchQuery, sortBy, posts } = get();
    if (loading) return;

    const currentPage = reset ? 0 : page;
    set({ loading: true });

    let query = supabase
      .from('posts')
      .select('*, regiones(id, nombre)')
      .range(currentPage * POSTS_PER_PAGE, (currentPage + 1) * POSTS_PER_PAGE - 1);

    if (sortBy === 'popular') {
      query = query.order('likes_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (regionFilter) query = query.eq('region_id', regionFilter);
    if (comunaFilter) query = query.eq('comuna_id', comunaFilter);
    if (categoriaFilter) query = query.eq('categoria', categoriaFilter);
    if (searchQuery.trim()) query = query.ilike('titulo', `%${searchQuery.trim()}%`);

    const { data, error } = await query;

    if (!error && data) {
      set({
        posts: reset ? data : [...posts, ...data],
        page: currentPage + 1,
        hasMore: data.length === POSTS_PER_PAGE,
        loading: false,
      });
    } else {
      set({ loading: false, hasMore: false });
    }
  },

  toggleLike: async (postId: string, userId: string) => {
    const { posts } = get();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const liked = post.user_liked;
    set({
      posts: posts.map((p) =>
        p.id === postId
          ? { ...p, user_liked: !liked, likes_count: liked ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      ),
    });
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: userId });
    }
  },

  toggleSave: async (postId: string, userId: string) => {
    const { posts } = get();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const saved = post.user_saved;
    set({
      posts: posts.map((p) => (p.id === postId ? { ...p, user_saved: !saved } : p)),
    });
    if (saved) {
      await supabase.from('guardados').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      await supabase.from('guardados').insert({ post_id: postId, user_id: userId });
    }
  },
}));
