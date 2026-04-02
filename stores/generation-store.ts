import { create } from 'zustand';

import type { GeneratedImage, ProcessedImage } from '@/types/media';

export type ImageSourceType = 'camera' | 'library';

export type SelectedImage = {
  uri: string;
  width: number;
  height: number;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number;
  source: ImageSourceType;
};

type GenerationState = {
  selectedImage: SelectedImage | null;
  processedImage: ProcessedImage | null;
  generatedImage: GeneratedImage | null;
  selectedStyle: string;
  setSelectedImage: (image: SelectedImage) => void;
  setProcessedImage: (image: ProcessedImage | null) => void;
  setGeneratedImage: (image: GeneratedImage | null) => void;
  clearSelectedImage: () => void;
  setSelectedStyle: (style: string) => void;
};

export const useGenerationStore = create<GenerationState>((set) => ({
  selectedImage: null,
  processedImage: null,
  generatedImage: null,
  selectedStyle: 'Professional',
  setSelectedImage: (image) => set({ selectedImage: image, processedImage: null, generatedImage: null }),
  setProcessedImage: (image) => set({ processedImage: image, generatedImage: null }),
  setGeneratedImage: (image) => set({ generatedImage: image }),
  clearSelectedImage: () => set({ selectedImage: null, processedImage: null, generatedImage: null }),
  setSelectedStyle: (style) => set({ selectedStyle: style, generatedImage: null }),
}));
