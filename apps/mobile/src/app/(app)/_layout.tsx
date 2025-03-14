import { Stack, useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import React from "react";

import { AppBar, AppBarIconButton, AppBarTitle } from "@/components/AppBar";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";

export default function AppLayout() {
  const { translate } = useLanguage();
  const router = useRouter();
  const colors = useColors();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="bookmarks/index"
        options={{
          title: translate("bookmarks"),
          header: () => (
            <AppBar>
              <AppBarIconButton
                icon={<ArrowLeftIcon size={22} color={colors.tintColor} />}
                onPress={() => router.back()}
              />
              <AppBarTitle title={translate("bookmarks")} />
            </AppBar>
          ),
        }}
      />
    </Stack>
  );
}
