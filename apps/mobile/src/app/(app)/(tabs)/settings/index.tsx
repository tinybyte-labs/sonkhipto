import { useScrollToTop } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import * as MailComposer from "expo-mail-composer";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FullScreenLoadingModal from "@/components/FullScreenLoadingModal";
import { ListItem, ListSection } from "@/components/List";
import {
  ANDROID_PACKAGE_NAME,
  APP_NAME,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  ITUNE_ITEM_ID,
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
  VERSION_WITH_BUILD_NUMBER,
} from "@/constants";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";

export default function SettingsMenuScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { translate } = useLanguage();
  const queryClient = useQueryClient();
  const listRef = useRef<ScrollView>(null);
  useScrollToTop(listRef);

  const sendFeedback = useCallback(async () => {
    try {
      await MailComposer.composeAsync({
        recipients: ["rohid@tinybytelabs.com"],
        subject: `${APP_NAME} Feedback - Platform ${Platform.OS}(${Platform.Version}) - Version ${VERSION_WITH_BUILD_NUMBER}`,
      });
    } catch (error: unknown) {
      Alert.alert(
        "Failed to Send Feedback",
        error instanceof Error ? error.message : String(error),
      );
    }
  }, []);

  const openURL = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      await Linking.openURL(url);
    } catch (error: unknown) {
      Alert.alert(
        "Failed to open URL",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRateTheAppPress = useCallback(async () => {
    setIsLoading(true);

    try {
      await Linking.openURL(
        Platform.select({
          android: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}&showAllReviews=true`,
          ios: `https://apps.apple.com/app/apple-store/id${ITUNE_ITEM_ID}?action=write-review`,
        }) ?? "",
      );
    } catch (error: unknown) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ScrollView
      ref={listRef}
      style={{ flexGrow: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: insets.bottom + 32,
        gap: 32,
        paddingTop: 32,
      }}
    >
      <FullScreenLoadingModal visible={isLoading} />
      <ListSection title={translate("chooseLanguage")}>
        <ListItem
          title={translate("language")}
          type="navigation"
          onPress={() => router.push("/settings/language")}
          icon={
            <Image
              source={require("@/assets/icons/language.png")}
              style={{ width: 24, height: 24, tintColor: colors.foreground }}
            />
          }
        />
      </ListSection>
      <ListSection title={translate("updateInterests")}>
        <ListItem
          title={translate("interests")}
          type="navigation"
          onPress={() => router.push("/settings/categories")}
          icon={
            <Image
              source={require("@/assets/icons/heart-fill.png")}
              style={{ width: 24, height: 24, tintColor: colors.foreground }}
            />
          }
        />
      </ListSection>

      <ListSection title={translate("info")}>
        <ListItem
          title={translate("rateTheApp")}
          type="navigation"
          onPress={handleRateTheAppPress}
          icon={
            <Image
              source={require("@/assets/icons/star.png")}
              style={{ width: 24, height: 24, tintColor: colors.foreground }}
            />
          }
        />

        <ListItem
          title={translate("sendFeedback")}
          type="navigation"
          onPress={sendFeedback}
          icon={
            <Image
              source={require("@/assets/icons/feedback.png")}
              style={{ width: 24, height: 24, tintColor: colors.foreground }}
            />
          }
        />

        <ListItem
          title={translate("privacyPolicy")}
          type="navigation"
          onPress={() => openURL(PRIVACY_POLICY_URL)}
          icon={
            <Image
              source={require("@/assets/icons/privacy-policy.png")}
              style={{ width: 24, height: 24, tintColor: colors.foreground }}
            />
          }
        />

        <ListItem
          title={translate("termsOfService")}
          type="navigation"
          onPress={() => openURL(TERMS_OF_SERVICE_URL)}
          icon={
            <Image
              source={require("@/assets/icons/terms-of-service.png")}
              style={{ width: 24, height: 24, tintColor: colors.foreground }}
            />
          }
        />
      </ListSection>
      <ListSection title={translate("social")}>
        <ListItem
          title={translate("followOnFacebook")}
          type="navigation"
          onPress={() => openURL(FACEBOOK_URL)}
          icon={
            <Image
              source={require("@/assets/icons/facebook.png")}
              style={{ width: 24, height: 24, tintColor: colors.foreground }}
            />
          }
        />

        <ListItem
          title={translate("followOnInstagram")}
          type="navigation"
          onPress={() => openURL(INSTAGRAM_URL)}
          icon={
            <Image
              source={require("@/assets/icons/instagram.png")}
              style={{ width: 24, height: 24, tintColor: colors.foreground }}
            />
          }
        />
      </ListSection>
      <ListSection title="Data">
        <ListItem
          title="Clear Cache"
          type="navigation"
          icon={
            <Image
              source={require("@/assets/icons/delete.png")}
              style={{ width: 24, height: 24, tintColor: colors.foreground }}
            />
          }
          onPress={() => {
            Alert.alert(
              "Clear Cache?",
              "Are you sure you want to clear all cache?",
              [
                {
                  style: "cancel",
                  text: "Cancel",
                },
                {
                  style: "destructive",
                  text: "Clear",
                  onPress: () => {
                    queryClient.clear();
                    void Image.clearDiskCache();
                    void Image.clearMemoryCache();
                  },
                },
              ],
            );
          }}
        />
      </ListSection>
      <View style={{ padding: 16, gap: 8 }}>
        <Text
          style={{ textAlign: "center", color: colors.secondaryForeground }}
        >
          {APP_NAME} v{VERSION_WITH_BUILD_NUMBER}
        </Text>
      </View>
    </ScrollView>
  );
}
