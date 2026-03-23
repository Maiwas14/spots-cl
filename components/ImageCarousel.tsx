import { View, ScrollView, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { useRef, useState } from 'react';

const { width } = Dimensions.get('window');

interface Props {
  urls: string[];
  height?: number;
}

export function ImageCarousel({ urls, height = width * 0.78 }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return <Image source={{ uri: urls[0] }} style={[styles.single, { height }]} resizeMode="cover" />;
  }

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {urls.map((url, i) => (
          <Image key={i} source={{ uri: url }} style={[styles.image, { height }]} resizeMode="cover" />
        ))}
      </ScrollView>
      {/* Dots */}
      <View style={styles.dots}>
        {urls.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
      {/* Counter */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>{activeIndex + 1}/{urls.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  single: { width },
  image: { width },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
  counter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  counterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
