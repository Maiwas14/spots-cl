import { useColorScheme } from 'react-native';

const LIGHT = {
  primary: '#1c4a30',
  primaryLight: '#2d6b4a',
  accent: '#e8c547',
  background: '#ffffff',
  surface: '#f6f6f6',
  text: '#111111',
  textMuted: '#888888',
  border: '#ebebeb',
  danger: '#ef4444',
  success: '#22c55e',
};

const DARK = {
  primary: '#3d8b5e',
  primaryLight: '#4fa870',
  accent: '#e8c547',
  background: '#0d0d0d',
  surface: '#1c1c1c',
  text: '#f0f0f0',
  textMuted: '#888888',
  border: '#2a2a2a',
  danger: '#ef4444',
  success: '#22c55e',
};

export type Colors = typeof LIGHT;

export function useColors(): Colors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK : LIGHT;
}

export const CATEGORIAS: { value: string; label: string; emoji: string }[] = [
  { value: 'naturaleza', label: 'Naturaleza', emoji: '🌿' },
  { value: 'playa', label: 'Playa', emoji: '🏖️' },
  { value: 'ciudad', label: 'Ciudad', emoji: '🏙️' },
  { value: 'sendero', label: 'Sendero', emoji: '🥾' },
  { value: 'pueblo', label: 'Pueblo', emoji: '🏘️' },
  { value: 'lago', label: 'Lago', emoji: '🏞️' },
  { value: 'montana', label: 'Montaña', emoji: '⛰️' },
];

export const POSTS_PER_PAGE = 12;
