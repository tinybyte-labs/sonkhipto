import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <Stack initialRouteName="welcome">
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="categories" options={{ headerShown: false }} />
    </Stack>
  );
}
