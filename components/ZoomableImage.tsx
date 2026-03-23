import { Modal, ScrollView, TouchableOpacity, StyleSheet, Dimensions, View, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Props {
  uri: string;
  visible: boolean;
  onClose: () => void;
}

export function ZoomableImage({ uri, visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          maximumZoomScale={4}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          centerContent
          bouncesZoom
        >
          <Image source={{ uri }} style={styles.image} contentFit="contain" />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  closeBtn: {
    position: 'absolute', top: 56, right: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width, height: height * 0.85 },
});
