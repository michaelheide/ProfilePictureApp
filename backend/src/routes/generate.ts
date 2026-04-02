import { z } from 'zod';
import type { FastifyInstance } from 'fastify';

import { generatePortrait } from '../lib/nano-banana.js';
import { normalizeImage, stripDataUrlPrefix, toDataUrl } from '../lib/image.js';

const bodySchema = z.object({
  style: z.string().min(1),
  imageBase64: z.string().min(1),
});

export async function registerGenerateRoute(app: FastifyInstance) {
  app.post('/generate', async (request, reply) => {
    const parsed = bodySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: parsed.error.flatten() });
    }

    const inputBase64 = stripDataUrlPrefix(parsed.data.imageBase64);
    const inputBuffer = Buffer.from(inputBase64, 'base64');
    const normalized = await normalizeImage(inputBuffer);
    const normalizedBase64 = normalized.buffer.toString('base64');

    const result = await generatePortrait({
      imageBase64: toDataUrl(normalizedBase64, normalized.mimeType),
      style: parsed.data.style,
      apiKey: process.env.NANO_BANANA_API_KEY,
      apiUrl: process.env.NANO_BANANA_API_URL,
      mock: process.env.MOCK_GENERATION === 'true',
    });

    return reply.send({
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
      promptUsed: result.promptUsed,
      provider: result.provider,
      normalized: {
        width: normalized.width,
        height: normalized.height,
        mimeType: normalized.mimeType,
      },
    });
  });
}
