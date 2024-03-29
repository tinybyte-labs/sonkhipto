import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import NetInfo from "@react-native-community/netinfo";
import { DarkTheme, Theme, ThemeProvider } from "@react-navigation/native";
import { onlineManager } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Provider as JotaiProvider } from "jotai";
import { ArrowLeftIcon } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { View, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Analytics from "@/components/Analytics";
import { AppBar, AppBarIconButton, AppBarTitle } from "@/components/AppBar";
import { colors } from "@/constants/colors";
import { useColors } from "@/hooks/useColors";
import AuthProvider from "@/providers/AuthProvider";
import LanguageProvider, { useLanguage } from "@/providers/LanguageProvider";
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
    [colorScheme],
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
    ],
  );

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      const status = !!state.isConnected;
      onlineManager.setOnline(status);
    });
  }, []);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <JotaiProvider>
      <TRPcProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ActionSheetProvider>
            <ThemeProvider value={theme}>
              <AuthProvider>
                <LanguageProvider>
                  <Analytics>
                    <StatusBar style={theme.dark ? "light" : "dark"} />
                    <RootLayoutNav />
                  </Analytics>
                </LanguageProvider>
              </AuthProvider>
            </ThemeProvider>
          </ActionSheetProvider>
        </GestureHandlerRootView>
      </TRPcProvider>
    </JotaiProvider>
  );
}

function RootLayoutNav() {
  const { translate } = useLanguage();
  const colors = useColors();

  useEffect(() => {
    const hideSplashScreen = async () => {
      try {
        await SplashScreen.hideAsync();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: any) {}
    };
    hideSplashScreen();
  }, []);

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
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
