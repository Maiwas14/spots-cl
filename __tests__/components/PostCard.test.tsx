import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { PostCard } from '@/components/PostCard';
import { useAuthStore } from '@/stores/authStore';
import { usePostsStore } from '@/stores/postsStore';
import { Post } from '@/types';

const mockPost: Post = {
  id: 'post-1',
  user_id: 'user-1',
  titulo: 'Cascada El Velo',
  descripcion: 'Una cascada hermosa',
  imagen_url: 'https://example.com/cascada.jpg',
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
};

describe('PostCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: { id: 'user-1' } as any });
  });

  test('renderiza el titulo del post', () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText('Cascada El Velo')).toBeTruthy();
  });

  test('muestra rating cuando rating_count > 0', () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText('⭐ 4.5')).toBeTruthy();
  });

  test('no muestra rating cuando rating_count es 0', () => {
    const post = { ...mockPost, rating_count: 0, rating_avg: 0 };
    const { queryByText } = render(<PostCard post={post} />);
    expect(queryByText(/⭐/)).toBeNull();
  });

  test('navega a detalle al presionar', () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    fireEvent.press(getByText('Cascada El Velo'));
    expect(router.push).toHaveBeenCalledWith('/lugar/post-1');
  });

  test('no hace nada al guardar si no hay user', () => {
    useAuthStore.setState({ user: null });
    const toggleSave = jest.fn();
    usePostsStore.setState({ toggleSave } as any);

    const { getByText } = render(<PostCard post={mockPost} />);
    // El bookmark icon se renderiza como texto "bookmark-outline" por el mock
    const bookmarkIcon = getByText('bookmark-outline');
    fireEvent.press(bookmarkIcon);

    expect(toggleSave).not.toHaveBeenCalled();
  });
});
