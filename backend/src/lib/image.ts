import sharp from 'sharp';

export async function normalizeImage(buffer: Buffer) {
  const image = sharp(buffer).rotate();
  const metadata = await image.metadata();
  const width = metadata.width ?? 1024;
  const height = metadata.height ?? 1024;
  const longestSide = Math.max(width, height);
  const scale = longestSide > 1024 ? 1024 / longestSide : 1;

  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const output = await image
    .resize({ width: targetWidth, height: targetHeight, fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();

  return {
    buffer: output,
    width: targetWidth,
    height: targetHeight,
    mimeType: 'image/jpeg' as const,
  };
}

export function stripDataUrlPrefix(value: string) {
  return value.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');
}

export function toDataUrl(base64: string, mimeType = 'image/jpeg') {
  return `data:${mimeType};base64,${base64}`;
}
