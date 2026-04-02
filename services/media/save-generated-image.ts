import * as MediaLibrary from 'expo-media-library';

export async function saveGeneratedImage(uri: string) {
  const permission = await MediaLibrary.requestPermissionsAsync();

  if (!permission.granted) {
    throw new Error('Photo library permission is required to save generated portraits.');
  }

  const asset = await MediaLibrary.createAssetAsync(uri);
  return asset;
}
