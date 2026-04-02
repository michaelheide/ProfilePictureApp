export type HistoryItem = {
  id: string;
  createdAt: string;
  style: string;
  sourceImageUri: string;
  processedImageUri: string;
  generatedImageUri?: string;
  sourceWidth: number;
  sourceHeight: number;
  processedWidth: number;
  processedHeight: number;
  processedFileSize?: number;
};
