import { generatePortraitWithGemini } from './gemini.js';
import { getProviderMode } from './provider.js';
import { getStylePrompt } from './style-prompts.js';

type GeneratePortraitParams = {
  imageBase64: string;
  style: string;
  apiKey?: string;
  apiUrl?: string;
  mock?: boolean;
};

export async function generatePortrait({ imageBase64, style, apiKey, apiUrl, mock }: GeneratePortraitParams) {
  const prompt = getStylePrompt(style);
  const providerMode = mock ? 'mock' : getProviderMode();

  if (providerMode === 'mock' || !apiKey) {
    return {
      imageBase64,
      mimeType: 'image/jpeg' as const,
      promptUsed: prompt,
      provider: 'mock',
    };
  }

  if (providerMode === 'gemini') {
    return generatePortraitWithGemini({
      imageBase64,
      style,
      apiKey,
      model: process.env.NANO_BANANA_GEMINI_MODEL ?? 'gemini-2.5-flash-image-preview',
    });
  }

  if (!apiUrl) {
    throw new Error('Missing NANO_BANANA_API_URL for custom provider mode');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      style,
      prompt,
      imageBase64,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Nano Banana request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    imageBase64?: string;
    mimeType?: string;
  };

  if (!data.imageBase64) {
    throw new Error('Nano Banana response did not include imageBase64');
  }

  return {
    imageBase64: data.imageBase64,
    mimeType: (data.mimeType ?? 'image/jpeg') as 'image/jpeg',
    promptUsed: prompt,
    provider: 'custom',
  };
}
