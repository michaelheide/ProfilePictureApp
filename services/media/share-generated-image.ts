import * as Sharing from 'expo-sharing';

export async function shareGeneratedImage(uri: string) {
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    throw new Error('Native sharing is not available on this device.');
  }

  await Sharing.shareAsync(uri, {
    dialogTitle: 'Share your AI ProfilePicture',
    mimeType: 'image/jpeg',
  });
}
