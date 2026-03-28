import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DIFICULTADES } from '@/constants';

interface Props {
  nivel: number;
  onSelect?: (nivel: number) => void;
}

export function DifficultyBar({ nivel, onSelect }: Props) {
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
            />
          );
        })}
      </View>
      <Text style={[styles.label, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  segments: { flexDirection: 'row', gap: 4 },
  segment: { width: 14, height: 20, borderRadius: 3 },
  segmentEmpty: { backgroundColor: '#d1d5db' },
  label: { fontSize: 13, fontWeight: '600' },
});
