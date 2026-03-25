import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useColors } from '@/constants';

interface Props {
  uri?: string | null;
  username?: string;
  size?: number;
}

export function Avatar({ uri, username = 'U', size = 40 }: Props) {
  const COLORS = useColors();
  const radius = size / 2;
  const fontSize = size * 0.4;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="cover"
      />
    );
  }

  return (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: radius, backgroundColor: COLORS.surface }]}>
      <Text style={[styles.initial, { fontSize, color: COLORS.textMuted }]}>
        {username[0].toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  initial: { fontWeight: '700' },
});
