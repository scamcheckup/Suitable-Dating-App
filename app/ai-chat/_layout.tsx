import { Stack } from 'expo-router';

export default function AIChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="aunty-love" />
      <Stack.Screen name="rizzman" />
    </Stack>
  );
}