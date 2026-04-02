import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import type { ProcessedImage } from '@/types/media';

export async function preprocessImage(uri: string, width: number, height: number): Promise<ProcessedImage> {
  const longestSide = Math.max(width, height);
  const scale = longestSide > 1024 ? 1024 / longestSide : 1;

  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const result = await manipulateAsync(
    uri,
    [
      {
        resize: {
          width: targetWidth,
          height: targetHeight,
        },
      },
    ],
    {
      compress: 0.8,
      format: SaveFormat.JPEG,
      base64: false,
    },
  );

  const fileInfo = await FileSystem.getInfoAsync(result.uri);

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    fileSize: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : undefined,
    mimeType: 'image/jpeg',
  };
}
