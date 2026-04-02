import { Link } from 'expo-router';
import { ScrollView, Text, View, Pressable } from 'react-native';

import { HistoryCard } from '@/components/history-card';
import { StylePicker } from '@/components/style-picker';
import { STYLE_PRESETS } from '@/constants/style-presets';
import { useHistoryStore } from '@/stores/history-store';

export default function HomeScreen() {
  const historyItems = useHistoryStore((state) => state.items);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }}
      style={{ flex: 1, backgroundColor: '#0B1020' }}
    >
      <View
        style={{
          padding: 24,
          borderRadius: 28,
          borderCurve: 'continuous',
          gap: 14,
          backgroundColor: '#16213D',
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.35)',
        }}
      >
        <View style={{ gap: 10 }}>
          <Text style={{ color: '#93C5FD', fontSize: 14, fontWeight: '700', letterSpacing: 0.6 }}>
            LOCAL-FIRST AI AVATARS
          </Text>
          <Text selectable style={{ color: '#F8FAFC', fontSize: 34, fontWeight: '800', lineHeight: 40 }}>
            Turn a portrait into a polished profile picture in seconds.
          </Text>
          <Text selectable style={{ color: '#CBD5E1', fontSize: 16, lineHeight: 24 }}>
            Pick a photo, choose a style, generate, save, and share. No account required.
          </Text>
        </View>

        <Link href="/capture" asChild>
          <Pressable
            style={{
              backgroundColor: '#F8FAFC',
              paddingVertical: 16,
              paddingHorizontal: 18,
              borderRadius: 18,
              borderCurve: 'continuous',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '800' }}>Start with a Photo</Text>
          </Pressable>
        </Link>
      </View>

      <StylePicker />

      <View style={{ gap: 12 }}>
        <Text selectable style={{ color: '#F8FAFC', fontSize: 22, fontWeight: '700' }}>
          Included styles
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {STYLE_PRESETS.map((style) => (
            <View
              key={style}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 999,
                borderCurve: 'continuous',
                backgroundColor: '#172033',
                borderWidth: 1,
                borderColor: '#23314E',
              }}
            >
              <Text style={{ color: '#E2E8F0', fontWeight: '600' }}>{style}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 14 }}>
        <Text selectable style={{ color: '#F8FAFC', fontSize: 22, fontWeight: '700' }}>
          Recent local portraits
        </Text>
        {historyItems.length > 0 ? (
          historyItems.slice(0, 3).map((item) => <HistoryCard key={item.id} item={item} />)
        ) : (
          <View
            style={{
              backgroundColor: '#121A2B',
              borderRadius: 20,
              borderCurve: 'continuous',
              padding: 16,
              borderWidth: 1,
              borderColor: '#1E293B',
            }}
          >
            <Text selectable style={{ color: '#CBD5E1', fontSize: 15, lineHeight: 22 }}>
              Your recent processed portraits will appear here and stay on device only.
            </Text>
          </View>
        )}
      </View>

      <View style={{ gap: 14 }}>
        <Text selectable style={{ color: '#F8FAFC', fontSize: 22, fontWeight: '700' }}>
          MVP goals
        </Text>
        {[
          'Expo app with camera + gallery import',
          'Local-only history and generated image storage',
          'Thin proxy backend to protect the image model key',
          'One-tap save and native share flow',
        ].map((item) => (
          <View
            key={item}
            style={{
              backgroundColor: '#121A2B',
              borderRadius: 20,
              borderCurve: 'continuous',
              padding: 16,
              borderWidth: 1,
              borderColor: '#1E293B',
            }}
          >
            <Text selectable style={{ color: '#CBD5E1', fontSize: 15, lineHeight: 22 }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
