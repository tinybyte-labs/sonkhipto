import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import NetInfo from "@react-native-community/netinfo";
import type { Theme } from "@react-navigation/native";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { onlineManager } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Provider as JotaiProvider } from "jotai";
import { useEffect, useMemo } from "react";
import { useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Analytics from "@/components/Analytics";
import { colors } from "@/constants/colors";
import { useColors } from "@/hooks/useColors";
import AuthProvider from "@/providers/AuthProvider";
import LanguageProvider from "@/providers/LanguageProvider";
import TRPcProvider from "@/providers/TRPcProvider";

export { ErrorBoundary } from "expo-router";

dayjs.extend(relativeTime);

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

void SplashScreen.preventAutoHideAsync();

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
  const colors = useColors();

  useEffect(() => {
    const hideSplashScreen = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error: unknown) {
        console.error(error);
      }
    };
    void hideSplashScreen();
  }, []);

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
