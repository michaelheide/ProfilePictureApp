import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { HistoryItem } from '@/types/history';

type HistoryState = {
  items: HistoryItem[];
  addItem: (item: HistoryItem) => void;
  upsertByProcessedUri: (item: HistoryItem) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  hasProcessedUri: (uri: string) => boolean;
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        if (get().items.some((existing) => existing.processedImageUri === item.processedImageUri)) {
          return;
        }

        set((state) => ({ items: [item, ...state.items].slice(0, 24) }));
      },
      upsertByProcessedUri: (item) => {
        const existing = get().items.find((entry) => entry.processedImageUri === item.processedImageUri);

        if (!existing) {
          set((state) => ({ items: [item, ...state.items].slice(0, 24) }));
          return;
        }

        set((state) => ({
          items: state.items.map((entry) =>
            entry.processedImageUri === item.processedImageUri
              ? {
                  ...entry,
                  ...item,
                  id: entry.id,
                  createdAt: entry.createdAt,
                }
              : entry,
          ),
        }));
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clearAll: () => set({ items: [] }),
      hasProcessedUri: (uri) => get().items.some((item) => item.processedImageUri === uri),
    }),
    {
      name: 'ai-profilepicture-history',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
