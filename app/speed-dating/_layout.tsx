import { Stack } from 'expo-router';

export default function SpeedDatingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="event/[id]" />
      <Stack.Screen name="room/[roomId]" />
    </Stack>
  );
}