import { renderHook, waitFor } from '@testing-library/react-native';
import { useRegiones } from '@/hooks/useRegiones';
import { supabase } from '@/lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockRegiones = [
  { id: 1, nombre: 'Arica y Parinacota', slug: 'arica-y-parinacota', orden: 1 },
  { id: 2, nombre: 'Tarapacá', slug: 'tarapaca', orden: 2 },
  { id: 13, nombre: 'Metropolitana', slug: 'metropolitana', orden: 13 },
];

describe('useRegiones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('carga regiones ordenadas al montar', async () => {
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn((cb: any) => {
        cb({ data: mockRegiones, error: null });
        return Promise.resolve();
      }),
    });

    const { result } = renderHook(() => useRegiones());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.regiones).toEqual(mockRegiones);
  });

  test('maneja error y deja regiones vacio', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn((cb: any) => {
        cb({ data: null, error: { message: 'network error' } });
        return Promise.resolve();
      }),
    });

    const { result } = renderHook(() => useRegiones());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.regiones).toEqual([]);
    consoleSpy.mockRestore();
  });
});
