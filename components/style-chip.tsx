import { Pressable, Text } from 'react-native';

import type { StylePreset } from '@/constants/style-presets';

type StyleChipProps = {
  label: StylePreset;
  selected: boolean;
  onPress: () => void;
};

export function StyleChip({ label, selected, onPress }: StyleChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 999,
        borderCurve: 'continuous',
        backgroundColor: selected ? '#2563EB' : '#172033',
        borderWidth: 1,
        borderColor: selected ? '#60A5FA' : '#23314E',
      }}
    >
      <Text
        style={{
          color: selected ? '#EFF6FF' : '#E2E8F0',
          fontWeight: '700',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
