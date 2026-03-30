import { CATEGORIAS, DIFICULTADES, POSTS_PER_PAGE } from '@/constants';

describe('Constants', () => {
  test('CATEGORIAS tiene 7 categorias', () => {
    expect(CATEGORIAS).toHaveLength(7);
  });

  test('cada categoria tiene value, label y emoji', () => {
    CATEGORIAS.forEach((cat) => {
      expect(cat).toHaveProperty('value');
      expect(cat).toHaveProperty('label');
      expect(cat).toHaveProperty('emoji');
      expect(cat.value).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(cat.emoji).toBeTruthy();
    });
  });

  test('DIFICULTADES tiene 4 niveles', () => {
    expect(DIFICULTADES).toHaveLength(4);
  });

  test('niveles de dificultad van del 1 al 4', () => {
    const niveles = DIFICULTADES.map((d) => d.nivel);
    expect(niveles).toEqual([1, 2, 3, 4]);
  });

  test('cada dificultad tiene nivel, label y color', () => {
    DIFICULTADES.forEach((d) => {
      expect(d.nivel).toBeGreaterThanOrEqual(1);
      expect(d.nivel).toBeLessThanOrEqual(4);
      expect(d.label).toBeTruthy();
      expect(d.color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  test('POSTS_PER_PAGE es 12', () => {
    expect(POSTS_PER_PAGE).toBe(12);
  });
});
