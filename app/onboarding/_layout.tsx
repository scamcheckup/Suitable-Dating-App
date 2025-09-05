import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="info" />
      <Stack.Screen name="basic-info" />
      <Stack.Screen name="lifestyle" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="archetype" />
      <Stack.Screen name="verification" />
    </Stack>
  );
}