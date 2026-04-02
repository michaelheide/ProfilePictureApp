import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { StylePicker } from '@/components/style-picker';
import { generatePortrait } from '@/services/api/generate-portrait';
import { formatFileSize } from '@/services/media/format-file-size';
import { preprocessImage } from '@/services/media/preprocess-image';
import { useGenerationStore } from '@/stores/generation-store';

const stages = ['Resize locally', 'Compress to JPEG', 'Send style request', 'Render result'];

async function triggerSuccessHaptic() {
  if (process.env.EXPO_OS === 'ios') {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

export default function GenerateScreen() {
  const selectedImage = useGenerationStore((state) => state.selectedImage);
  const processedImage = useGenerationStore((state) => state.processedImage);
  const selectedStyle = useGenerationStore((state) => state.selectedStyle);
  const setProcessedImage = useGenerationStore((state) => state.setProcessedImage);
  const setGeneratedImage = useGenerationStore((state) => state.setGeneratedImage);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handlePreprocess() {
    if (!selectedImage) {
      Alert.alert('Select a photo first', 'Go back and choose a portrait before preprocessing.');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await preprocessImage(selectedImage.uri, selectedImage.width, selectedImage.height);
      setProcessedImage(result);
      await triggerSuccessHaptic();
    } catch {
      Alert.alert('Preprocessing failed', 'We could not prepare the image for generation. Please try another photo.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleGenerate() {
    if (!processedImage) {
      Alert.alert('Preprocess first', 'Prepare the image locally before sending it to the backend.');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generatePortrait({
        processedImage,
        style: selectedStyle,
      });

      setGeneratedImage({
        uri: result.imageUri,
        mimeType: result.mimeType,
        promptUsed: result.promptUsed,
        provider: result.provider,
      });

      await triggerSuccessHaptic();
      router.push('/result');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Generation failed', message);
    } finally {
      setIsGenerating(false);
    }
  }

  const sourceImage = processedImage ?? selectedImage;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
      style={{ flex: 1, backgroundColor: '#0B1020' }}
    >
      <View style={{ gap: 8 }}>
        <Text selectable style={{ color: '#F8FAFC', fontSize: 30, fontWeight: '800' }}>
          Generation flow
        </Text>
        <Text selectable style={{ color: '#94A3B8', fontSize: 16, lineHeight: 24 }}>
          We now preprocess the image locally before adding the backend generation step.
        </Text>
      </View>

      {sourceImage ? (
        <View
          style={{
            backgroundColor: '#121A2B',
            borderRadius: 28,
            borderCurve: 'continuous',
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#1E293B',
          }}
        >
          <Image
            source={{ uri: sourceImage.uri }}
            contentFit="cover"
            style={{ width: '100%', aspectRatio: 4 / 5, backgroundColor: '#0F172A' }}
          />
          <View style={{ padding: 16, gap: 10 }}>
            <Text selectable style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>
              {processedImage ? 'Processed image preview' : 'Selected source image'}
            </Text>
            <Text selectable style={{ color: '#94A3B8', lineHeight: 22 }}>
              {sourceImage.width} × {sourceImage.height}
              {' · '}
              {processedImage ? formatFileSize(processedImage.fileSize) : formatFileSize(selectedImage?.fileSize)}
              {' · '}
              {processedImage ? 'JPEG ready for upload' : selectedImage?.source}
            </Text>
          </View>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: '#121A2B',
            borderRadius: 24,
            borderCurve: 'continuous',
            padding: 18,
            borderWidth: 1,
            borderColor: '#1E293B',
          }}
        >
          <Text selectable style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>
            No image selected yet
          </Text>
          <Text selectable style={{ color: '#94A3B8', marginTop: 6, lineHeight: 22 }}>
            Go back and choose a portrait before starting generation.
          </Text>
        </View>
      )}

      <StylePicker />

      <View
        style={{
          backgroundColor: '#121A2B',
          borderRadius: 28,
          borderCurve: 'continuous',
          padding: 20,
          gap: 16,
          borderWidth: 1,
          borderColor: '#1E293B',
        }}
      >
        <View style={{ gap: 10 }}>
          <Text selectable style={{ color: '#E2E8F0', fontSize: 18, fontWeight: '700' }}>
            Active style in queue
          </Text>
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#1D4ED8',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 999,
              borderCurve: 'continuous',
            }}
          >
            <Text style={{ color: '#DBEAFE', fontWeight: '700' }}>{selectedStyle}</Text>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          {stages.map((stage, index) => {
            const status =
              index === 0
                ? processedImage
                  ? 'Done'
                  : isProcessing
                    ? 'Active'
                    : 'Queued'
                : index === 1
                  ? processedImage
                    ? 'Done'
                    : isProcessing
                      ? 'Active'
                      : 'Queued'
                  : index === 2
                    ? isGenerating
                      ? 'Active'
                      : processedImage
                        ? 'Ready'
                        : 'Waiting'
                    : index === 3
                      ? isGenerating
                        ? 'Queued'
                        : 'Waiting'
                      : 'Waiting';

            const progressWidth =
              index === 0
                ? processedImage
                  ? '100%'
                  : isProcessing
                    ? '72%'
                    : '0%'
                : index === 1
                  ? processedImage
                    ? '100%'
                    : isProcessing
                      ? '48%'
                      : '0%'
                : index === 2
                  ? isGenerating
                    ? '68%'
                    : '0%'
                  : index === 3
                    ? isGenerating
                      ? '22%'
                      : '0%'
                    : '0%';

            return (
              <View key={stage} style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text selectable style={{ color: '#CBD5E1', fontWeight: '600' }}>
                    {stage}
                  </Text>
                  <Text selectable style={{ color: '#64748B', fontVariant: ['tabular-nums'] }}>
                    {status}
                  </Text>
                </View>
                <View
                  style={{
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: '#1E293B',
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: progressWidth,
                      height: '100%',
                      borderRadius: 999,
                      backgroundColor: '#60A5FA',
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#121A2B',
          borderRadius: 24,
          borderCurve: 'continuous',
          padding: 18,
          gap: 12,
          borderWidth: 1,
          borderColor: '#1E293B',
        }}
      >
        <Text selectable style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>
          Local preprocessing
        </Text>
        <Text selectable style={{ color: '#94A3B8', lineHeight: 22 }}>
          Resize the longest side to 1024px max and convert the image to JPEG at 80% quality.
        </Text>

        {processedImage ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[
              `${processedImage.width} × ${processedImage.height}`,
              formatFileSize(processedImage.fileSize),
              processedImage.mimeType,
            ].map((item) => (
              <View
                key={item}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderCurve: 'continuous',
                  backgroundColor: '#172033',
                  borderWidth: 1,
                  borderColor: '#23314E',
                }}
              >
                <Text selectable style={{ color: '#E2E8F0', fontWeight: '600' }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <Pressable
          onPress={() => void handlePreprocess()}
          disabled={!selectedImage || isProcessing}
          style={{
            backgroundColor: !selectedImage ? '#172033' : '#2563EB',
            paddingVertical: 16,
            borderRadius: 18,
            borderCurve: 'continuous',
            alignItems: 'center',
            opacity: isProcessing ? 0.7 : 1,
          }}
        >
          <Text style={{ color: !selectedImage ? '#64748B' : '#EFF6FF', fontSize: 16, fontWeight: '800' }}>
            {isProcessing ? 'Preprocessing…' : processedImage ? 'Run Again' : 'Preprocess Image'}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => void handleGenerate()}
        disabled={!processedImage || isGenerating}
        style={{
          backgroundColor: processedImage ? '#F8FAFC' : '#172033',
          paddingVertical: 16,
          borderRadius: 18,
          borderCurve: 'continuous',
          alignItems: 'center',
          opacity: isGenerating ? 0.7 : 1,
        }}
      >
        <Text style={{ color: processedImage ? '#0F172A' : '#64748B', fontSize: 16, fontWeight: '800' }}>
          {isGenerating ? 'Generating…' : processedImage ? 'Generate Portrait' : 'Preprocess before continuing'}
        </Text>
      </Pressable>

      <Link href="/result" asChild>
        <Pressable
          style={{
            backgroundColor: '#1E293B',
            paddingVertical: 16,
            borderRadius: 18,
            borderCurve: 'continuous',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '800' }}>Open Result Screen</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}
