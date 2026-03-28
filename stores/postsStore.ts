import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Post } from '@/types';
import { POSTS_PER_PAGE } from '@/constants';

function escapePostgrest(str: string): string {
  return str.replace(/[%_(),.\\]/g, '\\$&');
}

interface PostsState {
  posts: Post[];
  loading: boolean;
  hasMore: boolean;
  page: number;
  regionFilter: number | null;
  comunaFilter: number | null;
  categoriaFilter: string | null;
  dificultadFilter: number | null;
  searchQuery: string;
  sortBy: 'recent' | 'popular';
  setRegionFilter: (id: number | null) => void;
  setComunaFilter: (id: number | null) => void;
  setCategoriaFilter: (cat: string | null) => void;
  setDificultadFilter: (nivel: number | null) => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (sort: 'recent' | 'popular') => void;
  setMultipleFilters: (filters: {
    regionFilter?: number | null;
    comunaFilter?: number | null;
    categoriaFilter?: string | null;
    dificultadFilter?: number | null;
  }) => void;
  fetchPosts: (reset?: boolean) => Promise<void>;
  toggleSave: (postId: string, userId: string) => Promise<void>;
  updatePostInStore: (postId: string, updates: Partial<Post>) => void;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: false,
  hasMore: true,
  page: 0,
  regionFilter: null,
  comunaFilter: null,
  categoriaFilter: null,
  dificultadFilter: null,
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

  setDificultadFilter: (nivel) => {
    set({ dificultadFilter: nivel, page: 0, posts: [], hasMore: true });
    get().fetchPosts(true);
  },

  setSortBy: (sort) => {
    set({ sortBy: sort, page: 0, posts: [], hasMore: true });
    get().fetchPosts(true);
  },

  setMultipleFilters: (filters) => {
    set({ ...filters, page: 0, posts: [], hasMore: true });
    get().fetchPosts(true);
  },

  updatePostInStore: (postId, updates) => {
    set((state) => ({
      posts: state.posts.map((p) => (p.id === postId ? { ...p, ...updates } : p)),
    }));
  },

  fetchPosts: async (reset = false) => {
    const { loading, page, regionFilter, comunaFilter, categoriaFilter, dificultadFilter, searchQuery, sortBy, posts } = get();
    if (loading) return;

    const currentPage = reset ? 0 : page;
    set({ loading: true });

    let query = supabase
      .from('posts')
      .select('*, regiones(id, nombre)')
      .range(currentPage * POSTS_PER_PAGE, (currentPage + 1) * POSTS_PER_PAGE - 1);

    if (sortBy === 'popular') {
      query = query.order('rating_avg', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (regionFilter) query = query.eq('region_id', regionFilter);
    if (comunaFilter) query = query.eq('comuna_id', comunaFilter);
    if (categoriaFilter) query = query.eq('categoria', categoriaFilter);
    if (dificultadFilter) query = query.eq('dificultad', dificultadFilter);
    if (searchQuery.trim()) {
      const escaped = escapePostgrest(searchQuery.trim());
      query = query.or(`titulo.ilike.%${escaped}%,descripcion.ilike.%${escaped}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      // Merge user_saved from guardados
      const userId = useAuthStore.getState().user?.id;
      let postsWithSaved = data as Post[];
      if (userId && data.length > 0) {
        const postIds = data.map((p) => p.id);
        const { data: saved } = await supabase
          .from('guardados')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds);
        const savedIds = new Set(saved?.map((s) => s.post_id) ?? []);
        postsWithSaved = data.map((p) => ({ ...p, user_saved: savedIds.has(p.id) }));
      }

      set({
        posts: reset ? postsWithSaved : [...posts, ...postsWithSaved],
        page: currentPage + 1,
        hasMore: data.length === POSTS_PER_PAGE,
        loading: false,
      });
    } else {
      if (error) console.error('fetchPosts error:', error);
      set({ loading: false, hasMore: false });
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
    let error;
    if (saved) {
      ({ error } = await supabase.from('guardados').delete().eq('post_id', postId).eq('user_id', userId));
    } else {
      ({ error } = await supabase.from('guardados').insert({ post_id: postId, user_id: userId }));
    }
    if (error) {
      console.error('toggleSave error:', error);
      set({ posts: posts.map((p) => (p.id === postId ? { ...p, user_saved: saved } : p)) });
    }
  },
}));
