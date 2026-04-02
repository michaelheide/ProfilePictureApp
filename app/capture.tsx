import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View, Pressable, Alert } from 'react-native';

import { StylePicker } from '@/components/style-picker';
import { formatFileSize } from '@/services/media/format-file-size';
import { useGenerationStore } from '@/stores/generation-store';

async function triggerSelectionHaptic() {
  if (process.env.EXPO_OS === 'ios') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

export default function CaptureScreen() {
  const selectedImage = useGenerationStore((state) => state.selectedImage);
  const setSelectedImage = useGenerationStore((state) => state.setSelectedImage);
  const clearSelectedImage = useGenerationStore((state) => state.clearSelectedImage);

  const [isBusy, setIsBusy] = useState(false);

  const imageMeta = useMemo(() => {
    if (!selectedImage) {
      return [];
    }

    return [
      `${selectedImage.width} × ${selectedImage.height}`,
      formatFileSize(selectedImage.fileSize),
      selectedImage.source === 'camera' ? 'Captured in app' : 'Picked from library',
    ];
  }, [selectedImage]);

  async function openLibrary() {
    setIsBusy(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Photo access needed', 'Please allow photo library access to import a portrait.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.9,
        selectionLimit: 1,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        fileSize: asset.fileSize,
        source: 'library',
      });
      await triggerSelectionHaptic();
    } finally {
      setIsBusy(false);
    }
  }

  async function openCamera() {
    setIsBusy(true);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Camera access needed', 'Please allow camera access to capture a portrait.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.9,
        cameraType: ImagePicker.CameraType.front,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        fileSize: asset.fileSize,
        source: 'camera',
      });
      await triggerSelectionHaptic();
    } finally {
      setIsBusy(false);
    }
  }

  function continueToGenerate() {
    if (!selectedImage) {
      return;
    }

    router.push('/generate');
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
      style={{ flex: 1, backgroundColor: '#0B1020' }}
    >
      <View style={{ gap: 8 }}>
        <Text selectable style={{ color: '#F8FAFC', fontSize: 30, fontWeight: '800' }}>
          Choose a portrait
        </Text>
        <Text selectable style={{ color: '#94A3B8', fontSize: 16, lineHeight: 24 }}>
          Capture a selfie or import an existing photo. We will keep your assets local on device.
        </Text>
      </View>

      {selectedImage ? (
        <View
          style={{
            backgroundColor: '#111827',
            borderRadius: 28,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: '#1F2937',
            overflow: 'hidden',
          }}
        >
          <Image
            source={{ uri: selectedImage.uri }}
            contentFit="cover"
            style={{ width: '100%', aspectRatio: 4 / 5, backgroundColor: '#0F172A' }}
          />
          <View style={{ padding: 16, gap: 12 }}>
            <View style={{ gap: 6 }}>
              <Text selectable style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>
                Ready to generate
              </Text>
              <Text selectable style={{ color: '#94A3B8', lineHeight: 22 }}>
                This image is now selected for styling.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {imageMeta.map((item) => (
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
          </View>
        </View>
      ) : (
        <View
          style={{
            minHeight: 320,
            backgroundColor: '#111827',
            borderRadius: 28,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: '#1F2937',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            gap: 16,
          }}
        >
          <View
            style={{
              width: 220,
              height: 280,
              borderRadius: 999,
              borderWidth: 2,
              borderColor: '#60A5FA',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(96, 165, 250, 0.06)',
            }}
          >
            <Text selectable style={{ color: '#BFDBFE', fontSize: 16, fontWeight: '700' }}>
              Face guide overlay
            </Text>
          </View>
          <Text selectable style={{ color: '#CBD5E1', textAlign: 'center', lineHeight: 22 }}>
            Keep the face centered, eyes visible, and use soft frontal lighting for the best output.
          </Text>
        </View>
      )}

      <StylePicker />

      <View style={{ gap: 12 }}>
        <Pressable
          onPress={openCamera}
          disabled={isBusy}
          style={{
            backgroundColor: '#2563EB',
            borderRadius: 22,
            borderCurve: 'continuous',
            padding: 18,
            gap: 6,
            opacity: isBusy ? 0.6 : 1,
          }}
        >
          <Text selectable style={{ color: '#EFF6FF', fontSize: 18, fontWeight: '700' }}>
            {isBusy ? 'Working…' : 'Open Camera'}
          </Text>
          <Text selectable style={{ color: '#DBEAFE', fontSize: 15, lineHeight: 22 }}>
            Launch the front camera and capture a fresh portrait.
          </Text>
        </Pressable>

        <Pressable
          onPress={openLibrary}
          disabled={isBusy}
          style={{
            backgroundColor: '#121A2B',
            borderRadius: 22,
            borderCurve: 'continuous',
            padding: 18,
            gap: 6,
            borderWidth: 1,
            borderColor: '#1E293B',
            opacity: isBusy ? 0.6 : 1,
          }}
        >
          <Text selectable style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>
            Pick from Library
          </Text>
          <Text selectable style={{ color: '#94A3B8', fontSize: 15, lineHeight: 22 }}>
            Import an existing portrait from your device.
          </Text>
        </Pressable>
      </View>

      {selectedImage ? (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={clearSelectedImage}
            style={{
              flex: 1,
              backgroundColor: '#1E293B',
              paddingVertical: 16,
              borderRadius: 18,
              borderCurve: 'continuous',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '800' }}>Clear</Text>
          </Pressable>

          <Pressable
            onPress={continueToGenerate}
            style={{
              flex: 1,
              backgroundColor: '#F8FAFC',
              paddingVertical: 16,
              borderRadius: 18,
              borderCurve: 'continuous',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '800' }}>Continue</Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: '#172033',
            paddingVertical: 16,
            borderRadius: 18,
            borderCurve: 'continuous',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#64748B', fontSize: 16, fontWeight: '800' }}>Select a photo first</Text>
        </View>
      )}
    </ScrollView>
  );
}
