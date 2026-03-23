import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

export function SkeletonCard({ height = 200 }: { height?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { width: CARD_WIDTH, height, opacity }]} />
  );
}

export function SkeletonGrid() {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <SkeletonCard height={240} />
        <SkeletonCard height={190} />
      </View>
      <View style={styles.row}>
        <SkeletonCard height={190} />
        <SkeletonCard height={240} />
      </View>
      <View style={styles.row}>
        <SkeletonCard height={240} />
        <SkeletonCard height={190} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 12, paddingTop: 10 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { borderRadius: 14, backgroundColor: '#e8e8e8' },
});
