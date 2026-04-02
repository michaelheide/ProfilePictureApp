export type ProcessedImage = {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  mimeType: 'image/jpeg';
};

export type GeneratedImage = {
  uri: string;
  mimeType: string;
  promptUsed?: string;
  provider?: string;
};
