import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { formatFileSize } from '@/services/media/format-file-size';
import type { HistoryItem } from '@/types/history';

type HistoryCardProps = {
  item: HistoryItem;
};

export function HistoryCard({ item }: HistoryCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#121A2B',
        borderRadius: 22,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: '#1E293B',
        overflow: 'hidden',
      }}
    >
      <Image
        source={{ uri: item.processedImageUri }}
        contentFit="cover"
        style={{ width: '100%', aspectRatio: 4 / 5, backgroundColor: '#0F172A' }}
      />
      <View style={{ padding: 14, gap: 8 }}>
        <Text selectable style={{ color: '#F8FAFC', fontSize: 17, fontWeight: '700' }}>
          {item.style}
        </Text>
        <Text selectable style={{ color: '#94A3B8', lineHeight: 22 }}>
          {item.processedWidth} × {item.processedHeight} · {formatFileSize(item.processedFileSize)}
        </Text>
        <Text selectable style={{ color: '#64748B', fontSize: 13 }}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}
