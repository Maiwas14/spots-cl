import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, FlatList,
} from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/constants';
import type { Colors } from '@/constants';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🏔️',
    title: 'Descubre spots increíbles',
    subtitle: 'Explora los mejores lugares de Chile descubiertos por gente como tú.',
  },
  {
    emoji: '📍',
    title: 'Comparte tus lugares favoritos',
    subtitle: 'Sube fotos, agrega ubicación GPS y etiqueta la región y categoría.',
  },
  {
    emoji: '❤️',
    title: 'Conecta con otros exploradores',
    subtitle: 'Da like, guarda spots para más tarde y sigue a otros usuarios.',
  },
];

export default function OnboardingScreen() {
  const COLORS = useColors();
  const styles = getStyles(COLORS);

  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      finish();
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleNext}>
          <Text style={styles.btnText}>
            {activeIndex === SLIDES.length - 1 ? 'Empezar' : 'Siguiente'}
          </Text>
        </TouchableOpacity>
        {activeIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={finish} style={styles.skipBtn}>
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (C: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emoji: { fontSize: 80, marginBottom: 32 },
  title: { fontSize: 30, fontWeight: '800', color: C.text, textAlign: 'center', letterSpacing: -0.5, marginBottom: 16 },
  subtitle: { fontSize: 16, color: C.textMuted, textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.border },
  dotActive: { width: 20, backgroundColor: C.primary },
  footer: { paddingHorizontal: 28, paddingBottom: 12, gap: 12 },
  btn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 14, color: C.textMuted },
});
