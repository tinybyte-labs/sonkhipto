import { router, Stack } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";

import { AppBar, AppBarIconButton, AppBarTitle } from "@/components/AppBar";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";

export default function ProfileLayout() {
  const { translate } = useLanguage();
  const colors = useColors();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: translate("settings"),
          header: () => (
            <AppBar>
              <AppBarTitle title={translate("settings")} />
            </AppBar>
          ),
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          title: translate("language"),
          header: () => (
            <AppBar>
              <AppBarIconButton
                icon={<ArrowLeftIcon size={22} color={colors.tintColor} />}
                onPress={() => router.back()}
              />
              <AppBarTitle title={translate("language")} />
            </AppBar>
          ),
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          title: translate("interests"),
          header: () => (
            <AppBar>
              <AppBarIconButton
                icon={<ArrowLeftIcon size={22} color={colors.tintColor} />}
                onPress={() => router.back()}
              />
              <AppBarTitle title={translate("interests")} />
            </AppBar>
          ),
        }}
      />
    </Stack>
  );
}
