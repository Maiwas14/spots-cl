import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Helper para resetear el store entre tests
const resetStore = () => {
  useAuthStore.setState({
    session: null,
    user: null,
    profile: null,
    loading: true,
  });
};

describe('authStore', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  test('estado inicial correcto', () => {
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.loading).toBe(true);
  });

  test('setSession con session valida setea user y loading=false', () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@test.com' },
      access_token: 'token',
    } as any;

    // Mock fetchProfile para que no falle
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    useAuthStore.getState().setSession(mockSession);

    const state = useAuthStore.getState();
    expect(state.session).toBe(mockSession);
    expect(state.user).toEqual(mockSession.user);
    expect(state.loading).toBe(false);
  });

  test('setSession con null limpia user y loading=false', () => {
    useAuthStore.getState().setSession(null);

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });

  test('setProfile actualiza el perfil', () => {
    const mockProfile = {
      id: 'user-1',
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: null,
      bio: null,
      region_id: null,
      created_at: '2024-01-01',
    };

    useAuthStore.getState().setProfile(mockProfile);
    expect(useAuthStore.getState().profile).toEqual(mockProfile);
  });

  test('fetchProfile obtiene perfil de supabase', async () => {
    const mockProfile = {
      id: 'user-1',
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: null,
      bio: null,
      region_id: null,
      created_at: '2024-01-01',
    };

    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
    });

    await useAuthStore.getState().fetchProfile('user-1');
    expect(useAuthStore.getState().profile).toEqual(mockProfile);
  });

  test('fetchProfile no setea profile si data es null', async () => {
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
    });

    await useAuthStore.getState().fetchProfile('nonexistent');
    expect(useAuthStore.getState().profile).toBeNull();
  });

  test('signOut limpia session, user y profile', async () => {
    // Setear estado con datos
    useAuthStore.setState({
      session: { user: { id: 'u1' } } as any,
      user: { id: 'u1' } as any,
      profile: { id: 'u1', username: 'test' } as any,
    });

    await useAuthStore.getState().signOut();

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  test('setSession con user llama fetchProfile automaticamente', () => {
    const mockSession = {
      user: { id: 'user-1' },
      access_token: 'token',
    } as any;

    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    useAuthStore.getState().setSession(mockSession);

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
  });
});
