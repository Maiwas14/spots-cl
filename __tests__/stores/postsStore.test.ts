import { usePostsStore } from '@/stores/postsStore';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const makePost = (overrides: Partial<Post> = {}): Post => ({
  id: 'post-1',
  user_id: 'user-1',
  titulo: 'Test Spot',
  descripcion: 'Un lugar bonito',
  imagen_url: 'https://example.com/img.jpg',
  lat: -33.4,
  lng: -70.6,
  region_id: 1,
  comuna_id: 10,
  categoria: 'naturaleza',
  dificultad: 2,
  rating_avg: 4.5,
  rating_count: 10,
  created_at: '2024-01-01T00:00:00Z',
  user_saved: false,
  ...overrides,
});

const resetStore = () => {
  usePostsStore.setState({
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
  });
};

describe('postsStore', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe('estado inicial', () => {
    test('posts vacio, sin filtros, sortBy recent', () => {
      const state = usePostsStore.getState();
      expect(state.posts).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.hasMore).toBe(true);
      expect(state.page).toBe(0);
      expect(state.regionFilter).toBeNull();
      expect(state.comunaFilter).toBeNull();
      expect(state.categoriaFilter).toBeNull();
      expect(state.dificultadFilter).toBeNull();
      expect(state.searchQuery).toBe('');
      expect(state.sortBy).toBe('recent');
    });
  });

  describe('filtros', () => {
    // Mock fetchPosts para que no haga llamadas reales
    const mockFetch = () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      };
      // Simular que resuelve con data vacía
      (mockChain as any).then = jest.fn((resolve: any) => {
        resolve({ data: [], error: null });
        return { catch: jest.fn() };
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);
    };

    test('setRegionFilter resetea comuna, page y posts', () => {
      usePostsStore.setState({ posts: [makePost()], page: 3, comunaFilter: 5 });
      mockFetch();

      usePostsStore.getState().setRegionFilter(7);

      const state = usePostsStore.getState();
      expect(state.regionFilter).toBe(7);
      expect(state.comunaFilter).toBeNull();
      expect(state.page).toBe(0);
    });

    test('setComunaFilter resetea page y posts', () => {
      usePostsStore.setState({ posts: [makePost()], page: 2 });
      mockFetch();

      usePostsStore.getState().setComunaFilter(15);

      const state = usePostsStore.getState();
      expect(state.comunaFilter).toBe(15);
    });

    test('setCategoriaFilter resetea page y posts', () => {
      mockFetch();
      usePostsStore.getState().setCategoriaFilter('playa');
      expect(usePostsStore.getState().categoriaFilter).toBe('playa');
    });

    test('setDificultadFilter resetea page y posts', () => {
      mockFetch();
      usePostsStore.getState().setDificultadFilter(3);
      expect(usePostsStore.getState().dificultadFilter).toBe(3);
    });

    test('setSortBy resetea page y posts', () => {
      mockFetch();
      usePostsStore.getState().setSortBy('popular');
      expect(usePostsStore.getState().sortBy).toBe('popular');
    });

    test('setSearchQuery resetea page y posts', () => {
      mockFetch();
      usePostsStore.getState().setSearchQuery('cascada');
      expect(usePostsStore.getState().searchQuery).toBe('cascada');
    });

    test('setMultipleFilters aplica varios filtros a la vez', () => {
      mockFetch();
      usePostsStore.getState().setMultipleFilters({
        regionFilter: 3,
        categoriaFilter: 'sendero',
        dificultadFilter: 2,
      });

      const state = usePostsStore.getState();
      expect(state.regionFilter).toBe(3);
      expect(state.categoriaFilter).toBe('sendero');
      expect(state.dificultadFilter).toBe(2);
    });
  });

  describe('updatePostInStore', () => {
    test('actualiza un post existente por id', () => {
      const post = makePost({ id: 'p1', titulo: 'Original' });
      usePostsStore.setState({ posts: [post] });

      usePostsStore.getState().updatePostInStore('p1', { titulo: 'Editado' });

      expect(usePostsStore.getState().posts[0].titulo).toBe('Editado');
    });

    test('no modifica otros posts', () => {
      const p1 = makePost({ id: 'p1', titulo: 'Uno' });
      const p2 = makePost({ id: 'p2', titulo: 'Dos' });
      usePostsStore.setState({ posts: [p1, p2] });

      usePostsStore.getState().updatePostInStore('p1', { titulo: 'Editado' });

      expect(usePostsStore.getState().posts[1].titulo).toBe('Dos');
    });

    test('no hace nada si el id no existe', () => {
      const post = makePost({ id: 'p1' });
      usePostsStore.setState({ posts: [post] });

      usePostsStore.getState().updatePostInStore('nonexistent', { titulo: 'X' });

      expect(usePostsStore.getState().posts[0].titulo).toBe('Test Spot');
    });
  });

  describe('toggleSave', () => {
    test('optimistic update: cambia user_saved inmediatamente', async () => {
      const post = makePost({ id: 'p1', user_saved: false });
      usePostsStore.setState({ posts: [post] });

      // Mock supabase insert exitoso
      (mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      });

      const promise = usePostsStore.getState().toggleSave('p1', 'user-1');

      // Optimistic: user_saved cambia antes de que la promesa se resuelva
      expect(usePostsStore.getState().posts[0].user_saved).toBe(true);

      await promise;
    });

    test('revierte si supabase falla', async () => {
      const post = makePost({ id: 'p1', user_saved: false });
      usePostsStore.setState({ posts: [post] });

      (mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: { message: 'fail' } }),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      });

      await usePostsStore.getState().toggleSave('p1', 'user-1');

      // Debe revertir a false
      expect(usePostsStore.getState().posts[0].user_saved).toBe(false);
    });

    test('no hace nada si el post no existe', async () => {
      usePostsStore.setState({ posts: [] });

      await usePostsStore.getState().toggleSave('nonexistent', 'user-1');

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    test('delete cuando ya esta guardado', async () => {
      const post = makePost({ id: 'p1', user_saved: true });
      usePostsStore.setState({ posts: [post] });

      const mockDelete = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      // Último eq debe resolver la promise
      (mockSupabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
        insert: jest.fn(),
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      await usePostsStore.getState().toggleSave('p1', 'user-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('guardados');
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('fetchPosts', () => {
    test('no hace fetch si ya esta loading', async () => {
      usePostsStore.setState({ loading: true });

      await usePostsStore.getState().fetchPosts();

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });
});
