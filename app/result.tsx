import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable, Alert } from 'react-native';

import { StylePicker } from '@/components/style-picker';
import { saveGeneratedImage } from '@/services/media/save-generated-image';
import { shareGeneratedImage } from '@/services/media/share-generated-image';
import { useGenerationStore } from '@/stores/generation-store';
import { useHistoryStore } from '@/stores/history-store';

async function triggerSuccessHaptic() {
  if (process.env.EXPO_OS === 'ios') {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

export default function ResultScreen() {
  const selectedImage = useGenerationStore((state) => state.selectedImage);
  const processedImage = useGenerationStore((state) => state.processedImage);
  const generatedImage = useGenerationStore((state) => state.generatedImage);
  const selectedStyle = useGenerationStore((state) => state.selectedStyle);
  const upsertByProcessedUri = useHistoryStore((state) => state.upsertByProcessedUri);

  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!selectedImage || !processedImage) {
      return;
    }

    upsertByProcessedUri({
      id: `${Date.now()}-${processedImage.uri}`,
      createdAt: new Date().toISOString(),
      style: selectedStyle,
      sourceImageUri: selectedImage.uri,
      processedImageUri: processedImage.uri,
      sourceWidth: selectedImage.width,
      sourceHeight: selectedImage.height,
      processedWidth: processedImage.width,
      processedHeight: processedImage.height,
      processedFileSize: processedImage.fileSize,
      generatedImageUri: generatedImage?.uri,
    });
  }, [generatedImage?.uri, processedImage, selectedImage, selectedStyle, upsertByProcessedUri]);

  async function handleSave() {
    if (!generatedImage?.uri) {
      Alert.alert('No generated image', 'Generate a portrait before saving it to Photos.');
      return;
    }

    setIsSaving(true);

    try {
      await saveGeneratedImage(generatedImage.uri);
      await triggerSuccessHaptic();
      Alert.alert('Saved', 'Your generated portrait was saved to Photos.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save image.';
      Alert.alert('Save failed', message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleShare() {
    if (!generatedImage?.uri) {
      Alert.alert('No generated image', 'Generate a portrait before sharing it.');
      return;
    }

    setIsSharing(true);

    try {
      await shareGeneratedImage(generatedImage.uri);
      await triggerSuccessHaptic();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to share image.';
      Alert.alert('Share failed', message);
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
      style={{ flex: 1, backgroundColor: '#0B1020' }}
    >
      <View style={{ gap: 8 }}>
        <Text selectable style={{ color: '#F8FAFC', fontSize: 30, fontWeight: '800' }}>
          Before & after
        </Text>
        <Text selectable style={{ color: '#94A3B8', fontSize: 16, lineHeight: 24 }}>
          The source image stays local, and the generated portrait is cached on device after the backend responds.
        </Text>
        {processedImage ? (
          <Text selectable style={{ color: '#93C5FD', fontSize: 14, fontWeight: '700' }}>
            Added to local history automatically.
          </Text>
        ) : null}
        {generatedImage?.promptUsed ? (
          <Text selectable style={{ color: '#64748B', fontSize: 13, lineHeight: 20 }}>
            Prompt: {generatedImage.promptUsed}
          </Text>
        ) : null}
      </View>

      <StylePicker />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View
          style={{
            flex: 1,
            minHeight: 250,
            backgroundColor: '#121A2B',
            borderRadius: 24,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: '#1E293B',
            overflow: 'hidden',
          }}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage.uri }} contentFit="cover" style={{ flex: 1 }} />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <Text selectable style={{ color: '#64748B' }}>No source image</Text>
            </View>
          )}
          <View style={{ padding: 14 }}>
            <Text selectable style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>
              Before
            </Text>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            minHeight: 250,
            backgroundColor: '#121A2B',
            borderRadius: 24,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: '#1E293B',
            overflow: 'hidden',
          }}
        >
          {generatedImage ? (
            <Image source={{ uri: generatedImage.uri }} contentFit="cover" style={{ flex: 1 }} />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 }}>
              <Text selectable style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>
                After
              </Text>
              <Text selectable style={{ color: '#64748B', textAlign: 'center' }}>
                {processedImage
                  ? `Processed ${selectedStyle} JPEG is ready. Tap Generate Portrait to call your VPS backend.`
                  : `Generated ${selectedStyle} portrait preview will appear here after API integration.`}
              </Text>
            </View>
          )}
          {generatedImage ? (
            <View style={{ padding: 14, gap: 4 }}>
              <Text selectable style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>
                After
              </Text>
              <Text selectable style={{ color: '#64748B', fontSize: 13 }}>
                {generatedImage.provider ?? 'backend'}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={() => void handleSave()}
          disabled={!generatedImage || isSaving}
          style={{
            flex: 1,
            backgroundColor: generatedImage ? '#2563EB' : '#172033',
            paddingVertical: 16,
            borderRadius: 18,
            borderCurve: 'continuous',
            alignItems: 'center',
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          <Text style={{ color: generatedImage ? '#EFF6FF' : '#64748B', fontWeight: '800' }}>
            {isSaving ? 'Saving…' : 'Save to Photos'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => void handleShare()}
          disabled={!generatedImage || isSharing}
          style={{
            flex: 1,
            backgroundColor: generatedImage ? '#1E293B' : '#172033',
            paddingVertical: 16,
            borderRadius: 18,
            borderCurve: 'continuous',
            alignItems: 'center',
            opacity: isSharing ? 0.7 : 1,
          }}
        >
          <Text style={{ color: generatedImage ? '#E2E8F0' : '#64748B', fontWeight: '800' }}>
            {isSharing ? 'Sharing…' : 'Share'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
