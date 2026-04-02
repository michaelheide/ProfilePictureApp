import { getStylePrompt } from './style-prompts.js';

type GeminiGeneratePortraitParams = {
  imageBase64: string;
  style: string;
  apiKey: string;
  model: string;
};

type GeminiInlineDataPart = {
  inlineData?: {
    mimeType?: string;
    data?: string;
  };
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiInlineDataPart[];
    };
  }>;
};

function stripDataUrlPrefix(value: string) {
  return value.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');
}

export async function generatePortraitWithGemini({ imageBase64, style, apiKey, model }: GeminiGeneratePortraitParams) {
  const prompt = getStylePrompt(style);
  const rawBase64 = stripDataUrlPrefix(imageBase64);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: 'Transform the provided portrait into a premium profile picture while preserving identity, facial features, pose consistency, and a clean single-subject composition.',
          },
        ],
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Apply this style to the portrait: ${prompt}`,
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: rawBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const parts = data.candidates?.flatMap((candidate) => candidate.content?.parts ?? []) ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new Error('Gemini response did not include an image payload');
  }

  return {
    imageBase64: `data:${imagePart.inlineData.mimeType ?? 'image/jpeg'};base64,${imagePart.inlineData.data}`,
    mimeType: (imagePart.inlineData.mimeType ?? 'image/jpeg') as 'image/jpeg',
    promptUsed: prompt,
    provider: 'gemini',
  };
}
