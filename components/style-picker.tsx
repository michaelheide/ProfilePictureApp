import * as Haptics from 'expo-haptics';
import { ScrollView, Text, View } from 'react-native';

import { STYLE_PRESETS, type StylePreset } from '@/constants/style-presets';
import { useGenerationStore } from '@/stores/generation-store';
import { StyleChip } from '@/components/style-chip';

const STYLE_DESCRIPTIONS: Record<StylePreset, string> = {
  Professional: 'Clean studio headshot with polished lighting and a premium business look.',
  Anime: 'Bright cinematic anime portrait with expressive eyes and detailed line art.',
  Cyberpunk: 'Neon-soaked futuristic portrait with bold colors and moody city energy.',
  Editorial: 'Fashion-forward portrait with magazine-style composition and dramatic light.',
  Minimal: 'Soft, modern portrait with a refined palette and reduced visual noise.',
};

async function triggerStyleHaptic() {
  if (process.env.EXPO_OS === 'ios') {
    await Haptics.selectionAsync();
  }
}

export function StylePicker() {
  const selectedStyle = useGenerationStore((state) => state.selectedStyle);
  const setSelectedStyle = useGenerationStore((state) => state.setSelectedStyle);

  async function handleSelect(style: StylePreset) {
    setSelectedStyle(style);
    await triggerStyleHaptic();
  }

  return (
    <View
      style={{
        backgroundColor: '#121A2B',
        borderRadius: 24,
        borderCurve: 'continuous',
        paddingVertical: 18,
        gap: 14,
        borderWidth: 1,
        borderColor: '#1E293B',
      }}
    >
      <View style={{ paddingHorizontal: 18, gap: 6 }}>
        <Text selectable style={{ color: '#F8FAFC', fontSize: 20, fontWeight: '700' }}>
          Pick a style
        </Text>
        <Text selectable style={{ color: '#94A3B8', fontSize: 15, lineHeight: 22 }}>
          Choose the look you want before sending the image to the generator.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, gap: 10 }}
      >
        {STYLE_PRESETS.map((style) => (
          <StyleChip
            key={style}
            label={style}
            selected={style === selectedStyle}
            onPress={() => void handleSelect(style)}
          />
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 18 }}>
        <View
          style={{
            backgroundColor: '#172033',
            borderRadius: 18,
            borderCurve: 'continuous',
            padding: 14,
            gap: 8,
            borderWidth: 1,
            borderColor: '#23314E',
          }}
        >
          <Text selectable style={{ color: '#BFDBFE', fontSize: 13, fontWeight: '800', letterSpacing: 0.4 }}>
            ACTIVE STYLE
          </Text>
          <Text selectable style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>
            {selectedStyle}
          </Text>
          <Text selectable style={{ color: '#CBD5E1', lineHeight: 22 }}>
            {STYLE_DESCRIPTIONS[selectedStyle as StylePreset]}
          </Text>
        </View>
      </View>
    </View>
  );
}
