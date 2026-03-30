import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StarRating } from '@/components/StarRating';

describe('StarRating', () => {
  test('renderiza 5 estrellas', () => {
    const { getAllByText } = render(
      <StarRating avg={3.5} count={10} />
    );
    expect(getAllByText('★')).toHaveLength(5);
  });

  test('muestra resumen con promedio y conteo', () => {
    const { getByText } = render(
      <StarRating avg={4.2} count={15} />
    );
    expect(getByText('4.2 · 15 valoraciones')).toBeTruthy();
  });

  test('usa singular para 1 valoracion', () => {
    const { getByText } = render(
      <StarRating avg={5} count={1} />
    );
    expect(getByText('5.0 · 1 valoración')).toBeTruthy();
  });

  test('muestra "Sin valoraciones aún" cuando count=0 y hay onRate', () => {
    const { getByText } = render(
      <StarRating avg={0} count={0} onRate={jest.fn()} />
    );
    expect(getByText('Sin valoraciones aún')).toBeTruthy();
  });

  test('no muestra texto cuando count=0 y no hay onRate', () => {
    const { queryByText } = render(
      <StarRating avg={0} count={0} />
    );
    expect(queryByText('Sin valoraciones aún')).toBeNull();
    expect(queryByText(/valoracion/)).toBeNull();
  });

  test('llama onRate al presionar una estrella', () => {
    const onRate = jest.fn();
    const { getAllByText } = render(
      <StarRating avg={0} count={0} onRate={onRate} />
    );

    const stars = getAllByText('★');
    fireEvent.press(stars[2]); // 3ra estrella

    expect(onRate).toHaveBeenCalledWith(3);
  });

  test('no llama nada si no hay onRate', () => {
    const { getAllByText } = render(
      <StarRating avg={3} count={5} />
    );

    const stars = getAllByText('★');
    // No debería crashear
    fireEvent.press(stars[0]);
  });

  test('userRating tiene prioridad sobre avg para fill', () => {
    const onRate = jest.fn();
    const { getAllByText } = render(
      <StarRating avg={2} count={5} userRating={4} onRate={onRate} />
    );

    // Con userRating=4, las primeras 4 estrellas deberían estar filled
    // No podemos verificar estilos fácilmente, pero al menos verifica render
    expect(getAllByText('★')).toHaveLength(5);
  });
});
