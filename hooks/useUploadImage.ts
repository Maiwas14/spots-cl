import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export function useUploadImage() {
  const [uploading, setUploading] = useState(false);
  const user = useAuthStore((s) => s.user);

  const pickImage = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return null;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  const pickMultipleImages = async (): Promise<string[]> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return [];
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 5,
    });
    if (result.canceled) return [];
    return result.assets.map((a) => a.uri);
  };

  const takePhoto = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return null;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  const compressAndUpload = async (uri: string, fileName: string): Promise<string | null> => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    const response = await fetch(manipulated.uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    const { error } = await supabase.storage
      .from('lugares')
      .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('lugares').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    if (!user) return null;
    setUploading(true);
    try {
      return await compressAndUpload(uri, `${user.id}/${Date.now()}.jpg`);
    } catch (e) {
      console.error('Error uploading image:', e);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleImages = async (uris: string[]): Promise<string[]> => {
    if (!user || uris.length === 0) return [];
    setUploading(true);
    try {
      const results = await Promise.all(
        uris.map((uri, i) => compressAndUpload(uri, `${user.id}/${Date.now()}_${i}.jpg`))
      );
      return results.filter((url): url is string => url !== null);
    } catch (e) {
      console.error('Error uploading images:', e);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const uploadAvatar = async (uri: string): Promise<string | null> => {
    if (!user) return null;
    setUploading(true);
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 400 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      const url = await compressAndUpload(manipulated.uri, `avatars/${user.id}.jpg`);
      return url ? `${url}?t=${Date.now()}` : null;
    } catch (e) {
      console.error('Error uploading avatar:', e);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { pickImage, pickMultipleImages, takePhoto, uploadImage, uploadMultipleImages, uploadAvatar, uploading };
}
