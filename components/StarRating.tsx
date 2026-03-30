import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useColors } from '@/constants';
import type { Colors } from '@/constants';

interface Props {
  avg: number;
  count: number;
  userRating?: number;
  onRate?: (stars: number) => void;
}

export function StarRating({ avg, count, userRating, onRate }: Props) {
  const COLORS = useColors();
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = userRating ? star <= userRating : star <= Math.round(avg);
          return (
            <TouchableOpacity
              key={star}
              onPress={onRate ? () => onRate(star) : undefined}
              disabled={!onRate}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.star, filled ? styles.starFilled : styles.starEmpty]}>
                ★
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {count > 0 && (
        <Text style={styles.summary}>
          {avg.toFixed(1)} · {count} {count === 1 ? 'valoración' : 'valoraciones'}
        </Text>
      )}
      {count === 0 && onRate && (
        <Text style={styles.noRating}>Sin valoraciones aún</Text>
      )}
    </View>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stars: { flexDirection: 'row', gap: 2 },
  star: { fontSize: 24 },
  starFilled: { color: C.accent },
  starEmpty: { color: C.border },
  summary: { fontSize: 13, color: C.textMuted, fontWeight: '500' },
  noRating: { fontSize: 13, color: C.textMuted },
});
