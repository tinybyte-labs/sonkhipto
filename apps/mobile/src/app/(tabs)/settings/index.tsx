import * as Linking from "expo-linking";
import * as MailComposer from "expo-mail-composer";
import { router } from "expo-router";
import {
  BookmarkIcon,
  FacebookIcon,
  InstagramIcon,
  LanguagesIcon,
  MessageSquareIcon,
  ScrollTextIcon,
  StarIcon,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FullScreenLoadingModal from "@/components/FullScreenLoadingModal";
import { ListItem, ListSection } from "@/components/List";
import {
  APP_NAME,
  FACEBOOK_URL,
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
  VERSION_WITH_BUILD_NUMBER,
  ANDROID_PACKAGE_NAME,
  ITUNE_ITEM_ID,
  INSTAGRAM_URL,
} from "@/constants";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";

export default function SettingsMenuScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { translate } = useLanguage();

  const sendFeedback = useCallback(async () => {
    try {
      await MailComposer.composeAsync({
        recipients: ["rohid@tinybytelabs.com"],
        subject: `${APP_NAME} Feedback - Platform ${Platform.OS}(${Platform.Version}) - Version ${VERSION_WITH_BUILD_NUMBER}`,
      });
    } catch (error: any) {
      Alert.alert("Failed to Send Feedback", error.message);
    }
  }, []);

  const openURL = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      await Linking.openURL(url);
    } catch (error: any) {
      Alert.alert("Failed to open URL", error.message);
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
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ScrollView
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
          icon={<LanguagesIcon size={22} color={colors.foreground} />}
        />
      </ListSection>

      <ListSection title={translate("myContents")}>
        <ListItem
          title={translate("bookmarks")}
          type="navigation"
          onPress={() => router.push("/bookmarks/")}
          icon={<BookmarkIcon size={22} color={colors.foreground} />}
        />
      </ListSection>

      <ListSection title={translate("info")}>
        <ListItem
          title={translate("rateTheApp")}
          type="navigation"
          onPress={handleRateTheAppPress}
          icon={<StarIcon size={22} color={colors.foreground} />}
        />

        <ListItem
          title={translate("sendFeedback")}
          type="navigation"
          onPress={sendFeedback}
          icon={<MessageSquareIcon size={22} color={colors.foreground} />}
        />

        <ListItem
          title={translate("privacyPolicy")}
          type="navigation"
          onPress={() => openURL(PRIVACY_POLICY_URL)}
          icon={<ScrollTextIcon size={22} color={colors.foreground} />}
        />

        <ListItem
          title={translate("termsOfService")}
          type="navigation"
          onPress={() => openURL(TERMS_OF_SERVICE_URL)}
          icon={<ScrollTextIcon size={22} color={colors.foreground} />}
        />
      </ListSection>
      <ListSection title={translate("social")}>
        <ListItem
          title={translate("followOnFacebook")}
          type="navigation"
          onPress={() => openURL(FACEBOOK_URL)}
          icon={<FacebookIcon size={22} color={colors.foreground} />}
        />

        <ListItem
          title={translate("followOnInstagram")}
          type="navigation"
          onPress={() => openURL(INSTAGRAM_URL)}
          icon={<InstagramIcon size={22} color={colors.foreground} />}
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
