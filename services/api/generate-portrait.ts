import * as FileSystem from 'expo-file-system/legacy';

import type { ProcessedImage } from '@/types/media';

type GeneratePortraitParams = {
  processedImage: ProcessedImage;
  style: string;
};

export type GeneratePortraitResult = {
  imageUri: string;
  mimeType: string;
  promptUsed?: string;
  provider?: string;
};

function getApiBaseUrl() {
  const value = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!value) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  }

  return value.replace(/\/$/, '');
}

export async function generatePortrait({ processedImage, style }: GeneratePortraitParams): Promise<GeneratePortraitResult> {
  const fileBase64 = await FileSystem.readAsStringAsync(processedImage.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await fetch(`${getApiBaseUrl()}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      style,
      imageBase64: `data:${processedImage.mimeType};base64,${fileBase64}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Generate request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    imageBase64: string;
    mimeType?: string;
    promptUsed?: string;
    provider?: string;
  };

  const mimeType = data.mimeType ?? 'image/jpeg';
  const base64 = data.imageBase64.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');
  const outputUri = `${FileSystem.cacheDirectory}generated-${Date.now()}.jpg`;

  await FileSystem.writeAsStringAsync(outputUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return {
    imageUri: outputUri,
    mimeType,
    promptUsed: data.promptUsed,
    provider: data.provider,
  };
}
