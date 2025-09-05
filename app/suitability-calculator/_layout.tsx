import { Stack } from 'expo-router';

export default function SuitabilityCalculatorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="connect" />
      <Stack.Screen name="quiz/[sessionId]" />
      <Stack.Screen name="results/[sessionId]" />
    </Stack>
  );
}