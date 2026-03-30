import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useComments } from '@/hooks/useComments';
import { supabase } from '@/lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockComments = [
  {
    id: 'c1',
    post_id: 'post-1',
    user_id: 'user-1',
    texto: 'Qué bonito lugar!',
    created_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'c2',
    post_id: 'post-1',
    user_id: 'user-2',
    texto: 'Increíble',
    created_at: '2024-06-01T11:00:00Z',
  },
];

const mockProfiles = [
  { id: 'user-1', username: 'ana', avatar_url: null },
  { id: 'user-2', username: 'pedro', avatar_url: 'https://img.com/pedro.jpg' },
];

describe('useComments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('carga comentarios con perfiles al montar', async () => {
    // Mock del fetch de comments
    const commentChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockComments, error: null }),
    };

    // Mock del fetch de profiles
    const profileChain = {
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
    };

    let callCount = 0;
    (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'comments') return commentChain;
      if (table === 'profiles') return profileChain;
      return commentChain;
    });

    const { result } = renderHook(() => useComments('post-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toHaveLength(2);
    expect(result.current.comments[0].profiles?.username).toBe('ana');
    expect(result.current.comments[1].profiles?.username).toBe('pedro');
  });

  test('retorna array vacio si no hay comentarios', async () => {
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    const { result } = renderHook(() => useComments('post-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual([]);
  });

  test('maneja error en fetch de comentarios', async () => {
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }),
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useComments('post-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual([]);
    consoleSpy.mockRestore();
  });

  test('addComment inserta y re-fetch', async () => {
    // Setup inicial: sin comentarios
    const commentChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    };

    (mockSupabase.from as jest.Mock).mockReturnValue(commentChain);

    const { result } = renderHook(() => useComments('post-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const ok = await act(async () => {
      return result.current.addComment('user-1', 'Nuevo comentario');
    });

    expect(ok).toBe(true);
    expect(commentChain.insert).toHaveBeenCalledWith({
      post_id: 'post-1',
      user_id: 'user-1',
      texto: 'Nuevo comentario',
    });
  });

  test('addComment retorna false si falla', async () => {
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ error: { message: 'fail' } }),
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useComments('post-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const ok = await act(async () => {
      return result.current.addComment('user-1', 'Falla');
    });

    expect(ok).toBe(false);
    consoleSpy.mockRestore();
  });

  test('deleteComment elimina del estado local', async () => {
    (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'comments') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockComments, error: null }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
        };
      }
      return {};
    });

    const { result } = renderHook(() => useComments('post-1'));

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(2);
    });

    await act(async () => {
      await result.current.deleteComment('c1');
    });

    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0].id).toBe('c2');
  });
});
