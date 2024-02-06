import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { DarkTheme, Theme, ThemeProvider } from "@react-navigation/native";
import dayjs from "dayjs";

import "dayjs/locale/en";
import "dayjs/locale/bn-bd";

import { useEffect, useMemo } from "react";
import { useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import Analytics from "@/components/Analytics";
import { AppBar, AppBarIconButton, AppBarTitle } from "@/components/AppBar";
import { colors } from "@/constants/colors";
import { useColors } from "@/hooks/useColors";
import BookmarkProvider from "@/providers/BookmarkProvider";
import LanguageProvider, { useLanguage } from "@/providers/LanguageProvider";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowLeftIcon } from "lucide-react-native";
import TRPcProvider from "@/providers/TRPcProvider";

export { ErrorBoundary } from "expo-router";

dayjs.extend(relativeTime);

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({});
  const colorScheme = useColorScheme();
  const themedColors = useMemo(
    () => colors[colorScheme === "dark" ? "dark" : "light"],
    [colorScheme]
  );
  const theme = useMemo(
    (): Theme => ({
      dark: colorScheme === "dark",
      colors: {
        ...DarkTheme.colors,
        background: themedColors.background,
        card: themedColors.card,
        border: themedColors.border,
        primary: themedColors.primary,
        text: themedColors.foreground,
      },
    }),
    [
      colorScheme,
      themedColors.background,
      themedColors.border,
      themedColors.card,
      themedColors.foreground,
      themedColors.primary,
    ]
  );

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <TRPcProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ActionSheetProvider>
          <ThemeProvider value={theme}>
            <LanguageProvider>
              <BookmarkProvider>
                <Analytics>
                  <StatusBar style={theme.dark ? "light" : "dark"} />
                  <RootLayoutNav />
                </Analytics>
              </BookmarkProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ActionSheetProvider>
      </GestureHandlerRootView>
    </TRPcProvider>
  );
}

function RootLayoutNav() {
  const { translate } = useLanguage();
  const colors = useColors();

  useEffect(() => {
    const hideSplashScreen = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error: any) {
        console.log(error);
      }
    };
    hideSplashScreen();
  }, []);

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <Stack screenOptions={{ navigationBarColor: colors.transparent }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="language-selector"
          options={{
            headerShown: false,
            animation: "fade",
          }}
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
    </View>
  );
}
