import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: '#0B1020' },
          headerStyle: { backgroundColor: '#0B1020' },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: { color: '#F8FAFC' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'AI ProfilePicture' }} />
        <Stack.Screen name="capture" options={{ title: 'Choose Photo' }} />
        <Stack.Screen name="generate" options={{ title: 'Generate' }} />
        <Stack.Screen name="result" options={{ title: 'Result' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
