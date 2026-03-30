import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { DIFICULTADES, useColors } from '@/constants';
import type { Colors } from '@/constants';

interface Props {
  nivel: number;
  onSelect?: (nivel: number) => void;
}

export function DifficultyBar({ nivel, onSelect }: Props) {
  const COLORS = useColors();
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

  const info = DIFICULTADES.find((d) => d.nivel === nivel) ?? DIFICULTADES[0];

  return (
    <View style={styles.container}>
      <View style={styles.segments}>
        {DIFICULTADES.map((d) => {
          const active = d.nivel <= nivel;
          const Wrapper = onSelect ? TouchableOpacity : View;
          return (
            <Wrapper
              key={d.nivel}
              style={[
                styles.segment,
                active ? { backgroundColor: info.color } : styles.segmentEmpty,
              ]}
              onPress={onSelect ? () => onSelect(d.nivel) : undefined}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
            />
          );
        })}
      </View>
      <Text style={[styles.label, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  segments: { flexDirection: 'row', gap: 4 },
  segment: { width: 14, height: 20, borderRadius: 3 },
  segmentEmpty: { backgroundColor: C.border },
  label: { fontSize: 13, fontWeight: '600' },
});
