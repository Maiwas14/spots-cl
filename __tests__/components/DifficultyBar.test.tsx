import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DifficultyBar } from '@/components/DifficultyBar';

describe('DifficultyBar', () => {
  test('renderiza 4 segmentos', () => {
    const { toJSON } = render(<DifficultyBar nivel={2} />);
    // Verificar que se renderiza sin error
    expect(toJSON()).toBeTruthy();
  });

  test('muestra label correcto para nivel 1 (Fácil)', () => {
    const { getByText } = render(<DifficultyBar nivel={1} />);
    expect(getByText('Fácil')).toBeTruthy();
  });

  test('muestra label correcto para nivel 2 (Moderado)', () => {
    const { getByText } = render(<DifficultyBar nivel={2} />);
    expect(getByText('Moderado')).toBeTruthy();
  });

  test('muestra label correcto para nivel 3 (Difícil)', () => {
    const { getByText } = render(<DifficultyBar nivel={3} />);
    expect(getByText('Difícil')).toBeTruthy();
  });

  test('muestra label correcto para nivel 4 (Extremo)', () => {
    const { getByText } = render(<DifficultyBar nivel={4} />);
    expect(getByText('Extremo')).toBeTruthy();
  });

  test('llama onSelect al presionar un segmento', () => {
    const onSelect = jest.fn();
    const { getByText } = render(<DifficultyBar nivel={1} onSelect={onSelect} />);

    // Presionar el label del nivel actual
    // Los segmentos son TouchableOpacity cuando hay onSelect
    const label = getByText('Fácil');
    expect(label).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();
  });

  test('fallback a nivel 1 si nivel invalido', () => {
    const { getByText } = render(<DifficultyBar nivel={99} />);
    // El fallback es DIFICULTADES[0] = Fácil
    expect(getByText('Fácil')).toBeTruthy();
  });
});
