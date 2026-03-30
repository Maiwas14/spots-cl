import { renderHook, waitFor } from '@testing-library/react-native';
import { useComunas } from '@/hooks/useComunas';
import { supabase } from '@/lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockComunas = [
  { id: 100, nombre: 'Las Condes', region_id: 13 },
  { id: 101, nombre: 'Providencia', region_id: 13 },
  { id: 102, nombre: 'Santiago', region_id: 13 },
];

describe('useComunas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('carga comunas cuando regionId es valido', async () => {
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn((cb: any) => {
        cb({ data: mockComunas, error: null });
        return Promise.resolve();
      }),
    });

    const { result } = renderHook(() => useComunas(13));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comunas).toEqual(mockComunas);
  });

  test('retorna vacio cuando regionId es null', async () => {
    const { result } = renderHook(() => useComunas(null));

    expect(result.current.comunas).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  test('limpia comunas al cambiar regionId a null', async () => {
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn((cb: any) => {
        cb({ data: mockComunas, error: null });
        return Promise.resolve();
      }),
    });

    const { result, rerender } = renderHook(
      ({ regionId }) => useComunas(regionId),
      { initialProps: { regionId: 13 as number | null } }
    );

    await waitFor(() => {
      expect(result.current.comunas).toHaveLength(3);
    });

    rerender({ regionId: null });

    expect(result.current.comunas).toEqual([]);
  });

  test('maneja error de supabase', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn((cb: any) => {
        cb({ data: null, error: { message: 'error' } });
        return Promise.resolve();
      }),
    });

    const { result } = renderHook(() => useComunas(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comunas).toEqual([]);
    consoleSpy.mockRestore();
  });
});
